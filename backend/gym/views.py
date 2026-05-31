from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone
from datetime import date, timedelta
import random
from django.core.cache import cache
from .models import (
    Member, Coach, Session, Subscription, Enrollment, Salary, UserProfile,
    Product, Order, Payment, CoachBonus, Notification, AccessScan,
)
from .permissions import IsAdminOrResponsable, RolePermission, user_role
from .serializers import (
    UserSerializer, MemberSerializer, CoachSerializer, SessionSerializer,
    SubscriptionSerializer, EnrollmentSerializer, SalarySerializer,
    ProductSerializer, OrderSerializer, PaymentSerializer, CoachBonusSerializer,
    NotificationSerializer, AccessScanSerializer,
)


User = get_user_model()

INTERNAL_VERIFICATION_CODES = {
    'admin': '08111000',
    'responsable': '06111000',
}

OTP_TTL_SECONDS = 300


def generate_otp_code():
    return f'{random.randint(100000, 999999)}'


def send_sms_message(phone_number, message):
    """Send an SMS with Twilio when configured; otherwise return a simulated delivery."""
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
    auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
    from_number = getattr(settings, 'TWILIO_FROM_NUMBER', '')
    if account_sid and auth_token and from_number:
        try:
            from twilio.rest import Client
            Client(account_sid, auth_token).messages.create(
                body=message,
                from_=from_number,
                to=phone_number,
            )
            return {'type': 'sms', 'message': f'SMS envoye a {phone_number}.'}
        except Exception as exc:
            return {'type': 'sms_error', 'message': f'SMS non envoye: {exc}'}
    return {'type': 'sms_simulated', 'message': f'SMS simule vers {phone_number}: {message}'}


def notify_responsables_about_coach(coach):
    title = 'Nouvelle demande coach'
    message = (
        f'{coach.first_name} {coach.last_name} demande un compte coach. '
        f'Telephone: {coach.phone_number or coach.phone or "Non renseigne"}.'
    )
    responsable_users = User.objects.filter(gym_profile__role='responsable')
    for user in responsable_users:
        Notification.objects.create(user=user, title=title, message=message, type='warning')
    Notification.objects.create(user=None, title=title, message=message, type='warning')


def notify_user_email(email, title, message, notification_type='info'):
    user = User.objects.filter(email__iexact=email).first()
    if user:
        Notification.objects.create(user=user, title=title, message=message, type=notification_type)
    if email:
        send_mail(title, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)


def notify_session_audience(session, title, message, include_coach=True, include_clients=True):
    recipients = {'coach': 0, 'clients': 0}
    if include_coach and session.coach:
        notify_user_email(session.coach.email, title, message, 'warning')
        recipients['coach'] = 1
    if include_clients:
        enrollments = Enrollment.objects.select_related('member').filter(session=session)
        for enrollment in enrollments:
            notify_user_email(enrollment.member.email, title, message, 'warning')
            recipients['clients'] += 1
    return recipients


def send_subscription_confirmation_email(user, member, subscription, payment_method, card_last4=None):
    responsible_email = getattr(settings, 'GYM_RESPONSIBLE_EMAIL', settings.DEFAULT_FROM_EMAIL)
    responsible_name = getattr(settings, 'GYM_RESPONSIBLE_NAME', 'Responsable Wifak Club Gym')
    payment_label = 'Carte bancaire' if payment_method == 'card' else 'Reçu à l accueil'
    card_line = f'\nCarte terminee par: {card_last4}' if card_last4 else ''

    message = (
        f'Bonjour {member.first_name} {member.last_name},\n\n'
        f'Votre inscription a Wifak Club Gym est confirmee par {responsible_name}.\n\n'
        'Informations de votre abonnement:\n'
        f'- Type: {subscription.get_type_display()}\n'
        f'- Date debut: {subscription.start_date.strftime("%d/%m/%Y")}\n'
        f'- Date fin: {subscription.end_date.strftime("%d/%m/%Y")}\n'
        f'- Prix: {subscription.price} MAD\n'
        f'- Paiement: {payment_label}\n'
        f'- Statut: {"Paye" if subscription.is_paid else "A payer"}'
        f'{card_line}\n\n'
        'Merci pour votre confiance.\n'
        'Wifak Club Gym'
    )

    send_mail(
        'Confirmation de votre abonnement Wifak Club Gym',
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

    manager_message = (
        'Nouvelle inscription client:\n\n'
        f'Client: {member.first_name} {member.last_name}\n'
        f'Email: {member.email}\n'
        f'Telephone: {member.phone or "Non renseigne"}\n'
        f'Abonnement: {subscription.get_type_display()}\n'
        f'Periode: {subscription.start_date.strftime("%d/%m/%Y")} - {subscription.end_date.strftime("%d/%m/%Y")}\n'
        f'Prix: {subscription.price} MAD\n'
        f'Paiement: {payment_label}\n'
        f'Statut: {"Paye" if subscription.is_paid else "A payer"}'
        f'{card_line}'
    )

    send_mail(
        'Nouvelle inscription client - Wifak Club Gym',
        manager_message,
        settings.DEFAULT_FROM_EMAIL,
        [responsible_email],
        fail_silently=False,
    )


def build_gym_report_message():
    today = date.today()
    active_subscriptions = Subscription.objects.filter(is_active=True, end_date__gte=today)
    paid_total = Subscription.objects.filter(is_paid=True).aggregate(total=Sum('price'))['total'] or 0

    lines = [
        'Rapport Wifak Club Gym',
        '',
        'Resume:',
        f'- Clients: {Member.objects.count()} total, {Member.objects.filter(is_active=True).count()} actifs',
        f'- Coachs: {Coach.objects.count()} total, {Coach.objects.filter(is_active=True).count()} actifs',
        f'- Abonnements actifs: {active_subscriptions.count()}',
        f'- Total paiements recus: {paid_total} MAD',
        '',
        'Clients:',
    ]

    for member in Member.objects.order_by('first_name', 'last_name'):
        lines.append(
            f'- {member.first_name} {member.last_name} | {member.email} | '
            f'{member.phone or "Sans telephone"} | {member.subscription_type or "Sans abonnement"} | '
            f'{"Actif" if member.is_active else "Inactif"}'
        )

    lines.extend(['', 'Coachs:'])
    for coach in Coach.objects.order_by('first_name', 'last_name'):
        specialties = ', '.join(coach.specialties or []) or 'Sans specialite'
        lines.append(
            f'- {coach.first_name} {coach.last_name} | {coach.email} | '
            f'{coach.phone or "Sans telephone"} | {specialties} | Salaire: {coach.base_salary} MAD | '
            f'{"Actif" if coach.is_active else "Inactif"}'
        )

    lines.extend(['', 'Abonnements:'])
    subscriptions = Subscription.objects.select_related('member').order_by('-created_at')
    for subscription in subscriptions:
        lines.append(
            f'- {subscription.member.first_name} {subscription.member.last_name} | '
            f'{subscription.get_type_display()} | '
            f'{subscription.start_date.strftime("%d/%m/%Y")} - {subscription.end_date.strftime("%d/%m/%Y")} | '
            f'{subscription.price} MAD | {"Paye" if subscription.is_paid else "A payer"} | '
            f'{"Actif" if subscription.is_active else "Inactif"}'
        )

    return '\n'.join(lines)


def send_gym_report_email(recipient_email=None):
    recipient = recipient_email or getattr(settings, 'GYM_RESPONSIBLE_EMAIL', settings.DEFAULT_FROM_EMAIL)
    message = build_gym_report_message()
    send_mail(
        'Rapport abonnements, coachs et clients - Wifak Club Gym',
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )
    return recipient


def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5173').rstrip('/')
    reset_link = f'{frontend_url}/?reset_uid={uid}&reset_token={token}&reset_email={user.email}'
    message = (
        f'Bonjour {user.get_full_name() or user.username},\n\n'
        'Vous avez demande la recuperation de votre mot de passe Wifak Club Gym.\n\n'
        f'Lien de recuperation:\n{reset_link}\n\n'
        'Si le lien ne marche pas, utilisez ces informations dans le formulaire:\n'
        f'- Email: {user.email}\n'
        f'- Code utilisateur: {uid}\n'
        f'- Token: {token}\n\n'
        "Si vous n'avez pas demande cette operation, ignorez ce message."
    )
    send_mail(
        'Recuperation mot de passe - Wifak Club Gym',
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def build_user_payload(user):
    member = Member.objects.filter(email__iexact=user.email).first()
    coach = Coach.objects.filter(email__iexact=user.email).first()
    groups = set(user.groups.values_list('name', flat=True))

    profile_role = getattr(getattr(user, 'gym_profile', None), 'role', None)

    if user.is_superuser or user.is_staff or profile_role == 'admin' or 'admin' in groups:
        role = 'admin'
    elif profile_role == 'responsable' or 'reception' in groups or 'responsable' in groups:
        role = 'responsable'
    elif profile_role == 'coach' or coach:
        role = 'coach'
    elif profile_role == 'client' or member:
        role = 'client'
    else:
        role = 'client'

    return {
        'id': user.id,
        'name': user.get_full_name() or user.username,
        'email': user.email,
        'role': role,
        'member': MemberSerializer(member).data if member else None,
        'coach': CoachSerializer(coach).data if coach else None,
        'qr_code': getattr(getattr(user, 'gym_profile', None), 'qr_code', None),
    }


def build_auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': build_user_payload(user),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def token_login_view(request):
    response = login_view(request)
    if response.status_code != status.HTTP_200_OK:
        return response
    user = User.objects.filter(email__iexact=response.data['user']['email']).first()
    auth_payload = build_auth_response(user)
    auth_payload['notification'] = response.data.get('notification')
    return Response(auth_payload)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    requested_role = request.data.get('role', '')
    verification_code = ''.join(filter(str.isdigit, request.data.get('verification_code', '')))

    user = authenticate(request, username=email, password=password)
    if user is None:
        user = User.objects.filter(email__iexact=email).first()
        if user and not user.check_password(password):
            user = None

    if user is None:
        return Response(
            {'detail': 'Email ou mot de passe incorrect.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payload = build_user_payload(user)
    coach = Coach.objects.filter(email__iexact=user.email).first()
    if payload['role'] == 'coach':
        if not coach or coach.approval_status != Coach.ApprovalStatus.APPROVED or not coach.is_active or not user.is_active:
            return Response(
                {'detail': "Compte coach en attente d'approbation ou rejete par le responsable."},
                status=status.HTTP_403_FORBIDDEN,
            )
    elif not user.is_active:
        return Response(
            {'detail': 'Ce compte est inactif.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    if requested_role and requested_role != payload['role']:
        return Response(
            {'detail': "Ce compte n'a pas acces a cet espace."},
            status=status.HTTP_403_FORBIDDEN,
        )

    required_code = INTERNAL_VERIFICATION_CODES.get(payload['role'])
    if required_code and not verification_code:
        return Response({
            'requires_verification': True,
            'role': payload['role'],
            'email': user.email,
            'detail': 'Code de verification requis.',
        })
    if required_code and verification_code != required_code:
        return Response(
            {'detail': 'Code de verification incorrect.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    send_mail(
        'Connexion Wifak Club Gym',
        f'Bonjour {payload["name"]}, une connexion a votre espace {payload["role"]} a ete effectuee le {timezone.localtime().strftime("%d/%m/%Y a %H:%M")}.',
        'no-reply@wifakclub.local',
        [user.email],
        fail_silently=True,
    )

    return Response({
        **build_auth_response(user),
        'notification': {
            'type': 'email',
            'message': f'Notification envoyee a {user.email}.',
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response(
            {'detail': 'Email obligatoire.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()
    if user:
        send_password_reset_email(user)

    return Response({
        'notification': {
            'type': 'email',
            'message': 'Si ce compte existe, un email de recuperation a ete envoye.',
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    uid = request.data.get('uid', '').strip()
    token = request.data.get('token', '').strip()
    new_password = request.data.get('new_password', '')

    if not all([uid, token, new_password]):
        return Response(
            {'detail': 'Code utilisateur, token et nouveau mot de passe sont obligatoires.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(new_password) < 6:
        return Response(
            {'detail': 'Le mot de passe doit contenir au moins 6 caracteres.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is None or not default_token_generator.check_token(user, token):
        return Response(
            {'detail': 'Lien ou token de recuperation invalide.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    return Response({
        'notification': {
            'type': 'password',
            'message': 'Mot de passe modifie avec succes. Vous pouvez vous connecter.',
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_client(request):
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    email = request.data.get('email', '').strip().lower()
    phone = request.data.get('phone', '').strip()
    password = request.data.get('password', '')
    subscription_type = request.data.get('subscription_type', 'standard')
    payment_method = request.data.get('payment_method', 'card')
    card_number = ''.join(filter(str.isdigit, request.data.get('card_number', '')))
    card_name = request.data.get('card_name', '').strip()
    card_expiry = request.data.get('card_expiry', '').strip()
    card_cvv = request.data.get('card_cvv', '').strip()

    prices = {'simple': 250, 'standard': 350, 'pro': 450}
    if not all([first_name, last_name, email, password]):
        return Response(
            {'detail': 'Nom, prenom, email et mot de passe sont obligatoires.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if subscription_type not in prices:
        return Response(
            {'detail': 'Abonnement invalide.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if payment_method not in ['card', 'cash', 'reception']:
        return Response(
            {'detail': 'Mode de paiement invalide.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if payment_method == 'card':
        if not all([card_number, card_name, card_expiry, card_cvv]):
            return Response(
                {'detail': 'Les informations de carte bancaire sont obligatoires.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(card_number) < 12 or len(card_number) > 19:
            return Response(
                {'detail': 'Numero de carte invalide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(card_cvv) not in [3, 4] or not card_cvv.isdigit():
            return Response(
                {'detail': 'CVV invalide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
    if User.objects.filter(username__iexact=email).exists():
        return Response(
            {'detail': 'Un compte existe deja avec cet email.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    member, _ = Member.objects.update_or_create(
        email=email,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'is_active': True,
            'subscription_type': subscription_type,
        },
    )
    client_group, _ = Group.objects.get_or_create(name='client')
    user.groups.add(client_group)
    UserProfile.objects.update_or_create(
        user=user,
        defaults={'role': 'client', 'phone': phone},
    )

    today = date.today()
    if payment_method in ['reception', 'cash']:
        payment_method = 'cash'
        subscription_paid = False
        subscription_active = False
    else:
        subscription_paid = True
        subscription_active = True

    subscription = Subscription.objects.create(
        member=member,
        type=subscription_type,
        start_date=today,
        end_date=today + timedelta(days=30),
        price=prices[subscription_type],
        is_paid=subscription_paid,
        is_active=subscription_active,
    )

    card_last4 = card_number[-4:] if payment_method == 'card' else None
    Payment.objects.create(
        subscription=subscription,
        amount=subscription.price,
        method='card' if payment_method == 'card' else 'cash',
        status='paid' if payment_method == 'card' else 'pending',
        transaction_ref=f'WIFAK-SUB-{subscription.id}-{timezone.now().strftime("%H%M%S")}',
    )

    send_subscription_confirmation_email(
        user=user,
        member=member,
        subscription=subscription,
        payment_method=payment_method,
        card_last4=card_last4,
    )

    payload = build_user_payload(user)
    return Response({
        **build_auth_response(user),
        'subscription': SubscriptionSerializer(subscription).data,
        'payment': {
            'method': payment_method,
            'status': 'paid' if payment_method == 'card' else 'pending',
            'card_last4': card_last4,
            'message': 'Paiement confirme pour 30 jours.' if payment_method == 'card' else 'Recu genere. Payez a l accueil pour activer votre abonnement.',
        },
        'notification': {
            'type': 'email',
            'message': f'Email de confirmation envoye a {user.email}.',
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_coach(request):
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    email = request.data.get('email', '').strip().lower()
    phone = request.data.get('phone', '').strip()
    password = request.data.get('password', '')
    password_confirm = request.data.get('password_confirm', request.data.get('confirm_password', ''))
    specialties = request.data.get('specialties', [])
    base_salary = request.data.get('base_salary', 3000)

    if isinstance(specialties, str):
        specialties = [specialties]

    if not all([first_name, last_name, email, phone, password, password_confirm]):
        return Response(
            {'detail': 'Nom, prenom, email, telephone, mot de passe et confirmation sont obligatoires.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if password != password_confirm:
        return Response(
            {'detail': 'La confirmation du mot de passe ne correspond pas.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not specialties:
        return Response(
            {'detail': 'Choisissez au moins une specialite.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if User.objects.filter(username__iexact=email).exists():
        return Response(
            {'detail': 'Un compte existe deja avec cet email.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        is_active=False,
    )
    coach = Coach.objects.create(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        phone_number=phone,
        specialties=specialties,
        base_salary=base_salary,
        approval_status=Coach.ApprovalStatus.PENDING,
        is_active=False,
    )
    coach_group, _ = Group.objects.get_or_create(name='coach')
    user.groups.add(coach_group)
    UserProfile.objects.update_or_create(
        user=user,
        defaults={'role': 'coach', 'phone': phone},
    )

    today = date.today()
    salary = Salary.objects.create(
        coach=coach,
        month=today.strftime('%Y-%m'),
        base_salary=base_salary,
        session_bonus=0,
        is_paid=False,
        notes='Compte coach cree depuis le portail, en attente approbation responsable.',
    )
    cache.delete(f'otp:email:{email}')
    cache.delete(f'otp:phone:{phone}')
    notify_responsables_about_coach(coach)

    send_mail(
        'Demande coach recue - Wifak Club Gym',
        (
            f'Bonjour {first_name} {last_name},\n\n'
            'Votre demande de compte coach est en attente d approbation par le responsable d accueil.\n'
            f'Specialites: {", ".join(specialties)}\n'
            f'Salaire de base: {base_salary} MAD\n\n'
            'Vous pourrez vous connecter apres approbation.'
        ),
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=True,
    )

    return Response({
        'coach': CoachSerializer(coach).data,
        'salary': SalarySerializer(salary).data,
        'message': "Compte coach cree. Statut: en attente d'approbation.",
        'notification': {
            'type': 'approval_pending',
            'message': 'Demande envoyee au responsable d accueil.',
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({'user': build_user_payload(request.user)})


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    email = request.data.get('email', '').strip().lower()
    phone = request.data.get('phone', '').strip()
    role = request.data.get('role', '').strip() or 'client'
    if not email and not phone:
        return Response({'detail': 'Email ou telephone obligatoire pour envoyer le code.'}, status=status.HTTP_400_BAD_REQUEST)
    if role == 'coach':
        return Response({
            'notification': {
                'type': 'approval_pending',
                'message': "Aucun OTP n'est requis pour le coach. La demande sera validee par le responsable d'accueil.",
            }
        })

    code = INTERNAL_VERIFICATION_CODES.get(role) or generate_otp_code()
    ttl = OTP_TTL_SECONDS if role == 'coach' else 600
    # store code keyed by email and/or phone so verification can use either
    if email:
        cache.set(f'otp:email:{email}', code, ttl)
    if phone:
        cache.set(f'otp:phone:{phone}', code, ttl)

    # send email if email provided
    if email and role != 'coach':
        send_mail(
            'Code de verification Wifak Club Gym',
            (
                f'Votre code de verification {role} est: {code}\n\n'
                f'Ce code expire dans {ttl // 60} minutes.\n'
                f'Telephone associe: {phone or "Non renseigne"}'
            ),
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=True,
        )

    # simulate SMS send when phone provided (integrate real SMS provider here)
    sms_message = None
    if phone:
        sms_result = send_sms_message(phone, f'Votre code OTP Wifak Club Gym est {code}. Il expire dans {ttl // 60} minutes.')
        sms_message = sms_result['message']

    return Response({
        'notification': {
            'type': 'verification',
            'message': f"Code envoye{' par email a ' + email if email and role != 'coach' else ''}{' et ' if email and phone and role != 'coach' else ''}{'par SMS a ' + phone if phone else ''}. Expire dans {ttl // 60} minutes.",
            'dev_code': code,
            'sms': sms_message,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_support_message(request):
    subject = request.data.get('subject', 'Message Wifak Club').strip()
    message = request.data.get('message', '').strip()
    recipient = request.data.get('recipient', '').strip() or getattr(settings, 'GYM_RESPONSIBLE_EMAIL', settings.DEFAULT_FROM_EMAIL)
    if not message:
        return Response({'detail': 'Message obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)

    send_mail(
        subject,
        f'Envoye par: {request.user.email}\n\n{message}',
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=True,
    )
    Notification.objects.create(
        user=request.user,
        title='Message envoye',
        message=f'Message email envoye a {recipient}.',
        type='success',
    )
    return Response({'notification': {'type': 'email', 'message': f'Message envoye a {recipient}.'}})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_payment_history(request):
    member = Member.objects.filter(email__iexact=request.user.email).first()
    if not member:
        return Response([])

    payments = Payment.objects.filter(
        subscription__member=member
    ).select_related('subscription').order_by('-created_at')
    return Response(PaymentSerializer(payments, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email', '').strip().lower()
    phone = request.data.get('phone', '').strip()
    code = request.data.get('code', '').strip()

    # Try lookup user by email or by the profile phone before validating legacy OTP.
    user = User.objects.filter(email__iexact=email).first() if email else None
    if not user and phone:
        profile = UserProfile.objects.select_related('user').filter(phone=phone).first()
        if profile:
            user = profile.user

    # check cache keys for email or phone
    cached_email_code = cache.get(f'otp:email:{email}') if email else None
    cached_phone_code = cache.get(f'otp:phone:{phone}') if phone else None
    legacy_code = str(user.pk).zfill(6)[-6:] if user else ''
    role_code = INTERNAL_VERIFICATION_CODES.get(build_user_payload(user)['role']) if user else None

    if code not in {cached_email_code, cached_phone_code, legacy_code, role_code}:
        return Response({'detail': 'Code de verification invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    # delete any stored codes for this contact
    if email:
        cache.delete(f'otp:email:{email}')
    if phone:
        cache.delete(f'otp:phone:{phone}')

    if not user:
        return Response({'detail': 'Aucun utilisateur trouve pour ce contact.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'detail': 'Code de verification valide.', **build_auth_response(user)})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrResponsable])
def send_admin_report(request):
    recipient = request.data.get('email', '').strip().lower() or getattr(
        settings, 'GYM_RESPONSIBLE_EMAIL', settings.DEFAULT_FROM_EMAIL
    )
    send_gym_report_email(recipient)
    return Response({
        'notification': {
            'type': 'email',
            'message': f'Rapport envoye a {recipient}.',
        },
        'counts': {
            'clients': Member.objects.count(),
            'coachs': Coach.objects.count(),
            'subscriptions': Subscription.objects.count(),
        },
    })


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('-created_at')
    serializer_class = MemberSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable']


class CoachViewSet(viewsets.ModelViewSet):
    queryset = Coach.objects.all().order_by('first_name')
    serializer_class = CoachSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable']

    def get_queryset(self):
        queryset = Coach.objects.all().order_by('-created_at')
        approval_status = self.request.query_params.get('approval_status')
        if approval_status:
            queryset = queryset.filter(approval_status=approval_status.upper())
        return queryset

    @action(detail=False, methods=['get'], url_path='approval-stats')
    def approval_stats(self, request):
        return Response({
            'approved': Coach.objects.filter(approval_status=Coach.ApprovalStatus.APPROVED).count(),
            'pending': Coach.objects.filter(approval_status=Coach.ApprovalStatus.PENDING).count(),
            'rejected': Coach.objects.filter(approval_status=Coach.ApprovalStatus.REJECTED).count(),
        })

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        coach = self.get_object()
        coach.approval_status = Coach.ApprovalStatus.APPROVED
        coach.is_active = True
        coach.save(update_fields=['approval_status', 'is_active'])
        user = User.objects.filter(email__iexact=coach.email).first()
        if user:
            user.is_active = True
            user.save(update_fields=['is_active'])
            Notification.objects.create(
                user=user,
                title='Compte coach approuve',
                message='Votre compte coach est approuve. Vous pouvez vous connecter.',
                type='success',
            )
        send_mail(
            'Compte coach approuve - Wifak Club Gym',
            'Votre compte coach est approuve. Vous pouvez maintenant vous connecter.',
            settings.DEFAULT_FROM_EMAIL,
            [coach.email],
            fail_silently=True,
        )
        return Response(CoachSerializer(coach).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        coach = self.get_object()
        coach.approval_status = Coach.ApprovalStatus.REJECTED
        coach.is_active = False
        coach.save(update_fields=['approval_status', 'is_active'])
        user = User.objects.filter(email__iexact=coach.email).first()
        if user:
            user.is_active = False
            user.save(update_fields=['is_active'])
        send_mail(
            'Demande coach rejetee - Wifak Club Gym',
            'Votre demande de compte coach a ete rejetee. Contactez l accueil pour plus de details.',
            settings.DEFAULT_FROM_EMAIL,
            [coach.email],
            fail_silently=True,
        )
        return Response(CoachSerializer(coach).data)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related('coach').all()
    serializer_class = SessionSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable', 'coach', 'client']

    def perform_create(self, serializer):
        session = serializer.save()
        if session.coach:
            notify_user_email(
                session.coach.email,
                'Nouvelle seance ajoutee',
                (
                    f'Une seance {session.title} a ete ajoutee le {session.get_day_of_week_display()} '
                    f'de {session.start_time.strftime("%H:%M")} a {session.end_time.strftime("%H:%M")}.'
                ),
                'success',
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrResponsable])
    def cancel(self, request, pk=None):
        session = self.get_object()
        reason = request.data.get('message', '').strip() or 'La seance est annulee.'
        session.is_active = False
        session.save(update_fields=['is_active'])
        title = f'Seance annulee: {session.title}'
        message = (
            f'{title}\n'
            f'Jour: {session.get_day_of_week_display()}\n'
            f'Heure: {session.start_time.strftime("%H:%M")} - {session.end_time.strftime("%H:%M")}\n'
            f'Message: {reason}'
        )
        recipients = notify_session_audience(session, title, message, include_coach=True, include_clients=True)
        return Response({'session': SessionSerializer(session).data, 'recipients': recipients})

    @action(detail=True, methods=['post'], url_path='notify-coach', permission_classes=[IsAdminOrResponsable])
    def notify_coach(self, request, pk=None):
        session = self.get_object()
        if not session.coach:
            return Response({'detail': 'Cette seance n a pas de coach.'}, status=status.HTTP_400_BAD_REQUEST)
        message = request.data.get('message', '').strip() or 'Information concernant votre seance.'
        title = f'Info seance: {session.title}'
        notify_user_email(session.coach.email, title, message, 'info')
        return Response({'detail': 'Notification envoyee au coach.'})

    @action(detail=True, methods=['post'], url_path='notify-clients', permission_classes=[IsAdminOrResponsable])
    def notify_clients(self, request, pk=None):
        session = self.get_object()
        message = request.data.get('message', '').strip() or 'Information concernant votre seance.'
        title = f'Info seance: {session.title}'
        recipients = notify_session_audience(session, title, message, include_coach=False, include_clients=True)
        return Response({'detail': 'Notification envoyee aux clients inscrits.', 'recipients': recipients})


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related('member').all()
    serializer_class = SubscriptionSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable']


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('member', 'session').all()
    serializer_class = EnrollmentSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable', 'coach', 'client']

    def perform_create(self, serializer):
        enrollment = serializer.save()
        coach = enrollment.session.coach
        if coach:
            period = timezone.now().strftime('%Y-%m')
            CoachBonus.objects.create(
                coach=coach,
                label=f'Prime inscription - {enrollment.session.title}',
                amount=25,
                period=period,
            )
            Notification.objects.create(
                title='Prime coach ajoutée',
                message=f'Une prime de 25 MAD a été ajoutée pour {coach.first_name} {coach.last_name}.',
                type='success',
            )


class SalaryViewSet(viewsets.ModelViewSet):
    queryset = Salary.objects.select_related('coach').all()
    serializer_class = SalarySerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable', 'coach']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.prefetch_related('groups').all().order_by('first_name')
    serializer_class = UserSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-is_featured', 'brand', 'name')
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminOrResponsable()]


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if user_role(self.request.user) in {'admin', 'responsable'}:
            return Order.objects.prefetch_related('items__product').all().order_by('-created_at')
        return Order.objects.prefetch_related('items__product').filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        order.status = 'paid'
        order.save(update_fields=['status', 'updated_at'])
        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            method=request.data.get('method', 'card'),
            status='paid',
            transaction_ref=f'WIFAK-{order.id}-{timezone.now().strftime("%H%M%S")}',
        )
        Notification.objects.create(
            user=request.user,
            title='Commande payee',
            message=f'Votre commande #{order.id} est confirmee.',
            type='payment',
        )
        return Response({'order': OrderSerializer(order, context={'request': request}).data, 'payment': PaymentSerializer(payment).data})


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('order', 'subscription').all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable']


class CoachBonusViewSet(viewsets.ModelViewSet):
    queryset = CoachBonus.objects.select_related('coach').all().order_by('-created_at')
    serializer_class = CoachBonusSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable', 'coach']


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user__in=[self.request.user, None]).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)


class AccessScanViewSet(viewsets.ModelViewSet):
    queryset = AccessScan.objects.select_related('member').all().order_by('-scanned_at')
    serializer_class = AccessScanSerializer
    permission_classes = [RolePermission]
    allowed_roles = ['admin', 'responsable']

    def create(self, request, *args, **kwargs):
        qr_code = request.data.get('qr_code', '').strip()
        profile = UserProfile.objects.filter(qr_code=qr_code).select_related('user').first()
        member = Member.objects.filter(email__iexact=profile.user.email).first() if profile else None
        today = date.today()
        subscription = Subscription.objects.filter(member=member, is_active=True, end_date__gte=today).first() if member else None
        scan = AccessScan.objects.create(
            member=member,
            qr_code=qr_code,
            allowed=bool(subscription),
            reason='Abonnement actif' if subscription else 'Aucun abonnement actif',
        )
        return Response(AccessScanSerializer(scan).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_schedule(request):
    days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    result = []
    for day in days:
        sessions = Session.objects.filter(
            day_of_week=day, is_active=True
        ).select_related('coach').order_by('start_time')
        result.append({
            'day': day,
            'sessions': SessionSerializer(sessions, many=True).data
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_overview(request):
    today = date.today()
    today_day = today.strftime('%A').lower()
    day_map = {'monday': 'lundi', 'tuesday': 'mardi', 'wednesday': 'mercredi',
               'thursday': 'jeudi', 'friday': 'vendredi', 'saturday': 'samedi',
               'sunday': 'dimanche'}
    today_fr = day_map.get(today_day, '')
    return Response({
        'total_members': Member.objects.count(),
        'active_members': Member.objects.filter(is_active=True).count(),
        'total_coaches': Coach.objects.filter(is_active=True).count(),
        'approved_coaches': Coach.objects.filter(approval_status=Coach.ApprovalStatus.APPROVED).count(),
        'pending_coach_requests': Coach.objects.filter(approval_status=Coach.ApprovalStatus.PENDING).count(),
        'rejected_coach_requests': Coach.objects.filter(approval_status=Coach.ApprovalStatus.REJECTED).count(),
        'total_sessions_today': Session.objects.filter(
            day_of_week=today_fr, is_active=True).count(),
        'active_subscriptions': Subscription.objects.filter(
            is_active=True, end_date__gte=today).count(),
        'monthly_revenue': float(Subscription.objects.filter(
            is_paid=True,
            start_date__year=today.year,
            start_date__month=today.month
        ).aggregate(total=Sum('price'))['total'] or 0),
        'total_enrollments_this_month': Enrollment.objects.filter(
            enrolled_at__year=today.year,
            enrolled_at__month=today.month
        ).count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_revenue(request):
    data = (Subscription.objects
            .filter(is_paid=True)
            .annotate(month=TruncMonth('start_date'))
            .values('month')
            .annotate(revenue=Sum('price'))
            .order_by('month')[:6])
    return Response([{
        'month': item['month'].strftime('%Y-%m'),
        'revenue': float(item['revenue'])
    } for item in data])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_attendance(request):
    data = (Enrollment.objects
            .values('session__type')
            .annotate(count=Count('id'))
            .order_by('-count'))
    labels = {'biking': 'Biking', 'aerobic': 'Aerobic', 'zumba': 'Zumba',
              'dance_oriental': 'Danse Orientale', 'steps': 'Steps',
              'body_pump': 'Body Pump', 'musculation': 'Musculation'}
    return Response([{
        'label': labels.get(item['session__type'], item['session__type']),
        'count': item['count']
    } for item in data])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_subscriptions(request):
    data = (Subscription.objects
            .values('type')
            .annotate(count=Count('id'), revenue=Sum('price')))
    return Response([{
        'type': item['type'],
        'count': item['count'],
        'revenue': float(item['revenue'] or 0)
    } for item in data])

from datetime import date, datetime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from gym.models import (
    Coach,
    CoachBonus,
    Member,
    Payment,
    Salary,
    Session,
    Subscription,
    UserProfile,
)


def parse_time(value):
    return datetime.strptime(value, '%H:%M').time()


class Command(BaseCommand):
    help = 'Add default Wifak coaches, salaries, bonuses, sessions, and clients.'

    def handle(self, *args, **options):
        User = get_user_model()
        coach_group, _ = Group.objects.get_or_create(name='coach')
        client_group, _ = Group.objects.get_or_create(name='client')

        coaches = [
            ('Rachid', 'Samahakum', 'rachid.samahakum@wifakclub.ma', '+212600100001', ['musculation'], Decimal('4200'), Decimal('650')),
            ('Abdelhamid', 'Deghoughi', 'abdelhamid.deghoughi@wifakclub.ma', '+212600100002', ['biking', 'steps'], Decimal('3900'), Decimal('520')),
            ('Fadwa', 'Jasmi', 'fadwa.jasmi@wifakclub.ma', '+212600100003', ['zumba', 'dance_oriental'], Decimal('4100'), Decimal('610')),
            ('Aziz', 'Chaouki', 'aziz.chaouki@wifakclub.ma', '+212600100004', ['musculation'], Decimal('4300'), Decimal('700')),
            ('Youssef', 'Body Steps', 'youssef.bodysteps@wifakclub.ma', '+212600100005', ['steps', 'body_pump'], Decimal('3800'), Decimal('480')),
            ('Zakaria', 'Naghimi', 'zakaria.naghimi@wifakclub.ma', '+212600100006', ['biking'], Decimal('4000'), Decimal('560')),
        ]

        requested_coach_emails = {coach[2] for coach in coaches}
        Coach.objects.exclude(email__in=requested_coach_emails).delete()

        coach_by_email = {}
        for first, last, email, phone, specialties, salary, bonus in coaches:
            coach, _ = Coach.objects.update_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': phone,
                    'phone_number': phone,
                    'specialties': specialties,
                    'base_salary': salary,
                    'approval_status': Coach.ApprovalStatus.APPROVED,
                    'is_active': True,
                },
            )
            coach_by_email[email] = coach

            user, _ = User.objects.get_or_create(
                username=email,
                defaults={'email': email, 'first_name': first, 'last_name': last},
            )
            user.email = email
            user.first_name = first
            user.last_name = last
            user.is_active = True
            user.set_password('coach123')
            user.save()
            user.groups.set([coach_group])
            UserProfile.objects.update_or_create(user=user, defaults={'role': 'coach', 'phone': phone})

            Salary.objects.update_or_create(
                coach=coach,
                month=date.today().strftime('%Y-%m'),
                defaults={
                    'base_salary': salary,
                    'session_bonus': bonus,
                    'is_paid': False,
                    'notes': 'Salaire et prime par defaut.',
                },
            )
            CoachBonus.objects.update_or_create(
                coach=coach,
                label='Prime performance aleatoire',
                period=date.today().strftime('%Y-%m'),
                defaults={'amount': bonus, 'is_paid': False},
            )

        sessions = [
            ('Musculation Matin', 'musculation', 'rachid.samahakum@wifakclub.ma', 'lundi', '09:00', '10:30', 25),
            ('Biking Energie', 'biking', 'abdelhamid.deghoughi@wifakclub.ma', 'mardi', '18:00', '19:00', 18),
            ('Steps Cardio', 'steps', 'abdelhamid.deghoughi@wifakclub.ma', 'jeudi', '18:00', '19:00', 18),
            ('Zumba Dance', 'zumba', 'fadwa.jasmi@wifakclub.ma', 'mercredi', '19:00', '20:00', 22),
            ('Danse Orientale', 'dance_oriental', 'fadwa.jasmi@wifakclub.ma', 'vendredi', '18:30', '19:30', 22),
            ('Musculation Force', 'musculation', 'aziz.chaouki@wifakclub.ma', 'samedi', '10:00', '11:30', 25),
            ('Body Steps', 'body_pump', 'youssef.bodysteps@wifakclub.ma', 'dimanche', '10:00', '11:00', 20),
            ('Biking Weekend', 'biking', 'zakaria.naghimi@wifakclub.ma', 'samedi', '12:00', '13:00', 18),
        ]
        for title, type_, coach_email, day, start, end, capacity in sessions:
            Session.objects.update_or_create(
                title=title,
                defaults={
                    'type': type_,
                    'coach': coach_by_email[coach_email],
                    'day_of_week': day,
                    'start_time': parse_time(start),
                    'end_time': parse_time(end),
                    'max_capacity': capacity,
                    'description': f'Seance {title} avec coach Wifak.',
                    'is_active': True,
                },
            )

        clients = [
            ('Nadia', 'Amrani', 'nadia.amrani@example.com', '+212610200001', 'standard', Decimal('350')),
            ('Mehdi', 'Berrada', 'mehdi.berrada@example.com', '+212610200002', 'pro', Decimal('450')),
            ('Sara', 'Bennis', 'sara.bennis@example.com', '+212610200003', 'simple', Decimal('250')),
            ('Karim', 'Ouali', 'karim.ouali@example.com', '+212610200004', 'standard', Decimal('350')),
            ('Aya', 'Lahlou', 'aya.lahlou@example.com', '+212610200005', 'pro', Decimal('450')),
        ]
        requested_client_emails = {client[2] for client in clients}
        Member.objects.exclude(email__in=requested_client_emails).delete()
        keep_user_emails = requested_coach_emails | requested_client_emails | {'ladioui67@gmail.com', 'shabman22@gmail.com'}
        User.objects.exclude(email__in=keep_user_emails).delete()
        Payment.objects.filter(subscription__isnull=True, order__isnull=True).delete()
        today = date.today()
        for first, last, email, phone, sub_type, price in clients:
            member, _ = Member.objects.update_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': phone,
                    'is_active': True,
                    'subscription_type': sub_type,
                },
            )
            user, _ = User.objects.get_or_create(
                username=email,
                defaults={'email': email, 'first_name': first, 'last_name': last},
            )
            user.email = email
            user.first_name = first
            user.last_name = last
            user.is_active = True
            user.set_password('client123')
            user.save()
            user.groups.set([client_group])
            UserProfile.objects.update_or_create(user=user, defaults={'role': 'client', 'phone': phone})

            subscription, _ = Subscription.objects.update_or_create(
                member=member,
                type=sub_type,
                defaults={
                    'start_date': today,
                    'end_date': today + timedelta(days=30),
                    'price': price,
                    'is_paid': True,
                    'is_active': True,
                },
            )
            Payment.objects.update_or_create(
                subscription=subscription,
                transaction_ref=f'WIFAK-SUB-{member.id}',
                defaults={
                    'amount': price,
                    'method': 'cash',
                    'status': 'paid',
                },
            )

        self.stdout.write(self.style.SUCCESS('Default coaches, clients, salaries, bonuses, and sessions added.'))

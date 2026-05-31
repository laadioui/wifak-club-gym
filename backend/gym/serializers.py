from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Coach, Member, Session, Subscription, Enrollment, Salary, UserProfile,
    Product, Order, OrderItem, Payment, CoachBonus, Notification, AccessScan,
)


User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'phone', 'avatar_url', 'qr_code', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='gym_profile', read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'role', 'profile']

    def get_role(self, obj):
        if obj.is_superuser or obj.is_staff:
            return 'admin'
        if hasattr(obj, 'gym_profile'):
            return obj.gym_profile.role
        groups = set(obj.groups.values_list('name', flat=True))
        if 'coach' in groups:
            return 'coach'
        if 'reception' in groups or 'responsable' in groups:
            return 'responsable'
        return 'client'


class CoachSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source='get_approval_status_display', read_only=True)

    class Meta:
        model = Coach
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'phone_number', 'specialties', 'base_salary', 'approval_status',
            'status_label', 'is_active', 'created_at',
        ]
        read_only_fields = ['approval_status', 'status_label']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone',
            'is_active', 'subscription_type', 'created_at',
        ]


class SessionSerializer(serializers.ModelSerializer):
    coach = CoachSerializer(read_only=True)
    coach_id = serializers.PrimaryKeyRelatedField(
        queryset=Coach.objects.all(), source='coach', write_only=True, allow_null=True, required=False
    )
    current_enrollments = serializers.IntegerField(read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'type', 'coach', 'coach_id', 'day_of_week',
            'start_time', 'end_time', 'max_capacity', 'description',
            'is_active', 'created_at', 'current_enrollments',
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), source='member', write_only=True,
    )

    class Meta:
        model = Subscription
        fields = [
            'id', 'member', 'member_id', 'type', 'start_date', 'end_date',
            'price', 'is_paid', 'is_active', 'created_at',
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    session = SessionSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), source='member', write_only=True,
    )
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(), source='session', write_only=True,
    )

    class Meta:
        model = Enrollment
        fields = [
            'id', 'member', 'member_id', 'session', 'session_id',
            'enrolled_at', 'attended',
        ]


class SalarySerializer(serializers.ModelSerializer):
    coach = CoachSerializer(read_only=True)
    coach_id = serializers.PrimaryKeyRelatedField(
        queryset=Coach.objects.all(), source='coach', write_only=True,
    )

    class Meta:
        model = Salary
        fields = [
            'id', 'coach', 'coach_id', 'month', 'base_salary',
            'session_bonus', 'total_amount', 'is_paid', 'paid_at',
            'notes', 'created_at',
        ]
        read_only_fields = ['total_amount']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'category', 'description', 'price',
            'stock', 'image_url', 'rating', 'is_featured', 'is_active', 'created_at',
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), source='member', write_only=True, allow_null=True, required=False
    )
    items = OrderItemSerializer(many=True, required=False)
    payment_method = serializers.CharField(write_only=True, required=False, default='card')

    class Meta:
        model = Order
        fields = ['id', 'member', 'member_id', 'status', 'total_amount', 'items', 'payment_method', 'created_at', 'updated_at']
        read_only_fields = ['total_amount']

    def create(self, validated_data):
        payment_method = validated_data.pop('payment_method', 'card')
        items = validated_data.pop('items', [])
        request = self.context.get('request')
        order_status = 'paid' if payment_method == 'card' else 'pending'
        order = Order.objects.create(
            user=request.user if request and request.user.is_authenticated else None,
            status=order_status,
            **validated_data,
        )
        for item in items:
            product = item['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.get('quantity', 1),
                unit_price=item.get('unit_price') or product.price,
            )
        order.refresh_total()
        Payment.objects.create(
            order=order,
            amount=order.total_amount,
            method='card' if payment_method == 'card' else 'cash',
            status='paid' if payment_method == 'card' else 'pending',
            transaction_ref=f'WIFAK-ORDER-{order.id}-{timezone.now().strftime("%H%M%S")}',
        )
        if request and request.user.is_authenticated:
            Notification.objects.create(
                user=request.user,
                title='Commande payee' if payment_method == 'card' else 'Commande en attente',
                message=(
                    f'Votre commande #{order.id} a ete enregistree. Merci de payer a l accueil.'
                    if payment_method != 'card'
                    else f'Votre commande #{order.id} est confirmee. Merci pour votre achat.'
                ),
                type='payment',
            )
        return order


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'subscription', 'amount', 'method', 'status',
            'transaction_ref', 'created_at',
        ]


class CoachBonusSerializer(serializers.ModelSerializer):
    coach = CoachSerializer(read_only=True)
    coach_id = serializers.PrimaryKeyRelatedField(queryset=Coach.objects.all(), source='coach', write_only=True)

    class Meta:
        model = CoachBonus
        fields = ['id', 'coach', 'coach_id', 'label', 'amount', 'period', 'is_paid', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'type', 'is_read', 'created_at']
        read_only_fields = ['user']


class AccessScanSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)

    class Meta:
        model = AccessScan
        fields = ['id', 'member', 'qr_code', 'allowed', 'reason', 'scanned_at']

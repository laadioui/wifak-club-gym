from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


User = get_user_model()


class Coach(models.Model):
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        APPROVED = 'APPROVED', 'Approuve'
        REJECTED = 'REJECTED', 'Rejete'

    SPECIALTY_CHOICES = [
        ('biking', 'Biking'), ('aerobic', 'Aerobic'), ('zumba', 'Zumba'),
        ('dance_oriental', 'Danse Orientale'), ('steps', 'Steps'),
        ('body_pump', 'Body Pump'), ('musculation', 'Musculation'),
        ('yoga', 'Yoga'),
    ]
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    specialties = models.JSONField(default=list)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if self.phone and not self.phone_number:
            self.phone_number = self.phone
        if self.phone_number and not self.phone:
            self.phone = self.phone_number
        super().save(*args, **kwargs)


class Member(models.Model):
    SUB_CHOICES = [
        ('simple', 'Simple'), ('standard', 'Standard'), ('pro', 'Pro'),
    ]
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    subscription_type = models.CharField(max_length=20, choices=SUB_CHOICES,
                                          blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Session(models.Model):
    TYPE_CHOICES = [
        ('biking', 'Biking'), ('aerobic', 'Aerobic'), ('zumba', 'Zumba'),
        ('dance_oriental', 'Danse Orientale'), ('steps', 'Steps'),
        ('body_pump', 'Body Pump'), ('musculation', 'Musculation'),
        ('yoga', 'Yoga'), ('autre', 'Autre'),
    ]
    DAY_CHOICES = [
        ('lundi', 'Lundi'), ('mardi', 'Mardi'), ('mercredi', 'Mercredi'),
        ('jeudi', 'Jeudi'), ('vendredi', 'Vendredi'),
        ('samedi', 'Samedi'), ('dimanche', 'Dimanche'),
    ]
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    coach = models.ForeignKey(Coach, on_delete=models.SET_NULL,
                              null=True, related_name='sessions')
    day_of_week = models.CharField(max_length=20, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_capacity = models.IntegerField(default=20)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def current_enrollments(self):
        return self.enrollments.count()

    def __str__(self):
        return self.title


class Subscription(models.Model):
    TYPE_CHOICES = [
        ('simple', 'Simple'), ('standard', 'Standard'), ('pro', 'Pro'),
    ]
    member = models.ForeignKey(Member, on_delete=models.CASCADE,
                               related_name='subscriptions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Enrollment(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE,
                                     related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)

    class Meta:
        unique_together = ('member', 'session')


class Salary(models.Model):
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE,
                               related_name='salaries')
    month = models.CharField(max_length=7)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    session_bonus = models.DecimalField(max_digits=10, decimal_places=2,
                                       default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.base_salary + self.session_bonus
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('coach', 'Coach'),
        ('responsable', 'Responsable'),
        ('client', 'Client'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gym_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    qr_code = models.CharField(max_length=80, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = f'WIFAK-{self.user_id or "NEW"}-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        super().save(*args, **kwargs)


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('whey', 'Whey'),
        ('isolate', 'Isolate'),
        ('hydro', 'Hydro'),
        ('creatine', 'Creatine'),
        ('pre_workout', 'Pre Workout'),
        ('bcaa', 'BCAA'),
        ('eaa', 'EAA'),
        ('accessories', 'Accessoires fitness'),
    ]
    name = models.CharField(max_length=160)
    brand = models.CharField(max_length=100)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.80)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.brand} {self.name}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('cart', 'Panier'),
        ('pending', 'En attente'),
        ('paid', 'Payee'),
        ('preparing', 'Preparation'),
        ('delivered', 'Livree'),
        ('cancelled', 'Annulee'),
    ]
    member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='gym_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def refresh_total(self):
        self.total_amount = sum(item.subtotal for item in self.items.all())
        self.save(update_fields=['total_amount', 'updated_at'])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity


class Payment(models.Model):
    METHOD_CHOICES = [('card', 'Carte'), ('cash', 'Cash'), ('transfer', 'Virement')]
    STATUS_CHOICES = [('pending', 'En attente'), ('paid', 'Paye'), ('failed', 'Echec'), ('refunded', 'Rembourse')]
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='card')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
    transaction_ref = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CoachBonus(models.Model):
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name='bonuses')
    label = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=7)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    TYPE_CHOICES = [('info', 'Info'), ('success', 'Success'), ('warning', 'Warning'), ('payment', 'Paiement')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gym_notifications', null=True, blank=True)
    title = models.CharField(max_length=160)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class AccessScan(models.Model):
    member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='access_scans')
    qr_code = models.CharField(max_length=100)
    allowed = models.BooleanField(default=False)
    reason = models.CharField(max_length=200, blank=True)
    scanned_at = models.DateTimeField(auto_now_add=True)

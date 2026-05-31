from django.contrib import admin
from .models import (
    Coach, Member, Session, Subscription, Enrollment, Salary, UserProfile,
    Product, Order, OrderItem, Payment, CoachBonus, Notification, AccessScan,
)

@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number', 'approval_status', 'is_active')
    list_filter = ('approval_status', 'is_active')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'phone_number')


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'subscription_type', 'is_active')
    search_fields = ('first_name', 'last_name', 'email')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'coach', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('type', 'day_of_week', 'is_active')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('member', 'type', 'start_date', 'end_date', 'price', 'is_paid')
    list_filter = ('type', 'is_paid', 'is_active')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('member', 'session', 'enrolled_at', 'attended')


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ('coach', 'month', 'total_amount', 'is_paid')
    list_filter = ('month', 'is_paid')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'qr_code')
    list_filter = ('role',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'qr_code')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'stock', 'is_featured', 'is_active')
    list_filter = ('brand', 'category', 'is_featured', 'is_active')
    search_fields = ('name', 'brand')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'member', 'status', 'total_amount', 'created_at')
    list_filter = ('status',)
    inlines = [OrderItemInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'amount', 'method', 'status', 'transaction_ref', 'created_at')
    list_filter = ('method', 'status')


@admin.register(CoachBonus)
class CoachBonusAdmin(admin.ModelAdmin):
    list_display = ('coach', 'label', 'amount', 'period', 'is_paid')
    list_filter = ('period', 'is_paid')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')


@admin.register(AccessScan)
class AccessScanAdmin(admin.ModelAdmin):
    list_display = ('qr_code', 'member', 'allowed', 'reason', 'scanned_at')
    list_filter = ('allowed',)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'members', views.MemberViewSet)
router.register(r'coaches', views.CoachViewSet)
router.register(r'sessions', views.SessionViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'enrollments', views.EnrollmentViewSet)
router.register(r'salaries', views.SalaryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet, basename='orders')
router.register(r'payments', views.PaymentViewSet)
router.register(r'coach-bonuses', views.CoachBonusViewSet)
router.register(r'notifications', views.NotificationViewSet, basename='notifications')
router.register(r'access-scans', views.AccessScanViewSet)

urlpatterns = [
    path('auth/login/', views.login_view),
    path('auth/token/', views.token_login_view),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('auth/password-reset/request/', views.request_password_reset),
    path('auth/password-reset/confirm/', views.confirm_password_reset),
    path('auth/otp/request/', views.request_otp),
    path('auth/otp/verify/', views.verify_otp),
    path('support/message/', views.send_support_message),
    path('client/payments/', views.client_payment_history),
    path('auth/register-client/', views.register_client),
    path('auth/register-coach/', views.register_coach),
    path('auth/me/', views.me_view),
    path('admin/send-report/', views.send_admin_report),
    path('', include(router.urls)),
    path('schedule/', views.weekly_schedule),
    path('stats/overview/', views.stats_overview),
    path('stats/revenue/', views.stats_revenue),
    path('stats/attendance/', views.stats_attendance),
    path('stats/subscriptions/', views.stats_subscriptions),
]

from rest_framework import permissions


def user_role(user):
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser or user.is_staff:
        return 'admin'
    if hasattr(user, 'gym_profile'):
        return user.gym_profile.role
    groups = set(user.groups.values_list('name', flat=True))
    if 'admin' in groups:
        return 'admin'
    if 'coach' in groups:
        return 'coach'
    if 'reception' in groups or 'responsable' in groups:
        return 'responsable'
    return 'client'


class IsAdminOrResponsable(permissions.BasePermission):
    def has_permission(self, request, view):
        return user_role(request.user) in {'admin', 'responsable'}


class RolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        allowed_roles = getattr(view, 'allowed_roles', None)
        if not allowed_roles:
            return request.user and request.user.is_authenticated
        return user_role(request.user) in set(allowed_roles)

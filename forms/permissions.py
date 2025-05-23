from rest_framework import permissions


class IsStateOfficial(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == "state"
        )


class IsCountyOfficial(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == "county"
        )


class FormPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return IsStateOfficial().has_permission(request, view)

    def has_object_permission(self, request, view, file):
        # For detail views: state sees all, county sees only their own
        if IsStateOfficial().has_permission(request, view):
            return True
        return file.countyofficials_completed == request.user or file.countyofficials_incomplete == request.user

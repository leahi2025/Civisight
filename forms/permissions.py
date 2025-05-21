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


class CompletedFormPermission(permissions.BasePermission):
    """
    - POST (uploading a completion): only CountyOfficials.
    - SAFE_METHODS: allow any authenticated to list/retrieve.
    - Other methods not supported (returns False).
    """

    def has_permission(self, request, view):
        if request.method == "POST":
            return IsCountyOfficial().has_permission(request, view)
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return False

    def has_object_permission(self, request, view, obj):
        # For detail views: state sees all, county sees only their own
        if IsStateOfficial().has_permission(request, view):
            return True
        return obj.completed_by == request.user

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsAdminReadLoginRetrieve(BasePermission):
    """
    Project 권한:
    - 목록(list): 모두 허용
    - 상세(retrieve): 로그인 사용자만
    - 생성/수정/삭제: staff만
    """

    def has_permission(self, request, view):
        action = getattr(view, 'action', None)
        if action == 'list':
            return True
        if action == 'retrieve':
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsAuthorOrStaffOrReadOnly(BasePermission):
    """
    - 목록/상세 읽기: 모두 허용
    - 생성: 로그인 사용자 허용
    - 수정/삭제: 작성자 본인 또는 staff 허용
    """

    def has_permission(self, request, view):
        action = getattr(view, 'action', None)
        if action == 'list':
            return True
        if action == 'retrieve':
            return True
        if request.method in SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        return obj.created_by_id == request.user.id

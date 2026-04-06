from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Follow, OperatorNote
from .serializers import OperatorNoteSerializer, RegisterSerializer, UserPreviewSerializer


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        login(request, user)

        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_authenticated': True,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_authenticated': True,
            },
            status=status.HTTP_200_OK,
        )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)


class MeAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'is_authenticated': False}, status=status.HTTP_200_OK)

        followers_count = Follow.objects.filter(following=request.user).count()
        following_count = Follow.objects.filter(follower=request.user).count()

        return Response(
            {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_authenticated': True,
                'followers_count': followers_count,
                'following_count': following_count,
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not request.user.check_password(current_password):
            return Response({'detail': '현재 비밀번호가 올바르지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'detail': '새 비밀번호는 8자 이상이어야 합니다.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()

        user = authenticate(request, username=request.user.username, password=new_password)
        if user:
            login(request, user)

        return Response({'detail': '비밀번호가 변경되었습니다.'}, status=status.HTTP_200_OK)


class WithdrawAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get('password', '')

        if not request.user.check_password(password):
            return Response({'detail': '비밀번호가 올바르지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.user.id
        logout(request)
        User.objects.filter(id=user_id).delete()

        return Response({'detail': '회원탈퇴가 완료되었습니다.'}, status=status.HTTP_200_OK)


class FollowingListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(follower_relations__follower=request.user).distinct()
        serializer = UserPreviewSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FollowersListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(following_relations__following=request.user).distinct()
        serializer = UserPreviewSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FollowToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)

        if target.id == request.user.id:
            return Response({'detail': '본인은 팔로우할 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        _, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if created:
            return Response({'detail': 'Followed', 'is_following': True}, status=status.HTTP_200_OK)

        return Response({'detail': 'Already following', 'is_following': True}, status=status.HTTP_200_OK)

    def delete(self, request, username):
        target = get_object_or_404(User, username=username)
        deleted_count, _ = Follow.objects.filter(follower=request.user, following=target).delete()
        if deleted_count > 0:
            return Response({'detail': 'Unfollowed', 'is_following': False}, status=status.HTTP_200_OK)
        return Response({'detail': 'Not following', 'is_following': False}, status=status.HTTP_200_OK)


class FollowStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        target = get_object_or_404(User, username=username)
        is_following = Follow.objects.filter(follower=request.user, following=target).exists()
        return Response({'is_following': is_following}, status=status.HTTP_200_OK)


class OperatorNoteListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = OperatorNoteSerializer(OperatorNote.objects.filter(user=request.user), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        title = (request.data.get('title') or '').strip()
        content = (request.data.get('content') or '').strip()
        if not title:
            return Response({'detail': '제목을 입력하세요.'}, status=status.HTTP_400_BAD_REQUEST)
        if not content:
            return Response({'detail': '내용을 입력하세요.'}, status=status.HTTP_400_BAD_REQUEST)

        note = OperatorNote.objects.create(user=request.user, title=title, content=content)
        return Response(OperatorNoteSerializer(note).data, status=status.HTTP_201_CREATED)


class AdminOperatorNoteListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = OperatorNoteSerializer(OperatorNote.objects.select_related('user').all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'CSRF cookie set'}, status=status.HTTP_200_OK)

from django.db.models import Count, Prefetch
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, ChatRoom, Follow, UserPresence
from .serializers import ChatMessageSerializer, ChatRoomSerializer, RegisterSerializer, UserPreviewSerializer


def touch_presence(user):
    if user and user.is_authenticated:
        UserPresence.objects.update_or_create(user=user, defaults={'last_seen': timezone.now()})


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        login(request, user)
        touch_presence(user)

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
        touch_presence(user)
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

        touch_presence(request.user)
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
        touch_presence(request.user)
        users = User.objects.filter(follower_relations__follower=request.user).select_related('presence').distinct()
        serializer = UserPreviewSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FollowersListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        touch_presence(request.user)
        users = User.objects.filter(following_relations__following=request.user).select_related('presence').distinct()
        serializer = UserPreviewSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FollowToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        touch_presence(request.user)
        target = get_object_or_404(User, username=username)

        if target.id == request.user.id:
            return Response({'detail': '본인은 팔로우할 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        _, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if created:
            return Response({'detail': 'Followed', 'is_following': True}, status=status.HTTP_200_OK)

        return Response({'detail': 'Already following', 'is_following': True}, status=status.HTTP_200_OK)

    def delete(self, request, username):
        touch_presence(request.user)
        target = get_object_or_404(User, username=username)
        deleted_count, _ = Follow.objects.filter(follower=request.user, following=target).delete()
        if deleted_count > 0:
            return Response({'detail': 'Unfollowed', 'is_following': False}, status=status.HTTP_200_OK)
        return Response({'detail': 'Not following', 'is_following': False}, status=status.HTTP_200_OK)


class FollowStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        touch_presence(request.user)
        target = get_object_or_404(User, username=username)
        is_following = Follow.objects.filter(follower=request.user, following=target).exists()
        return Response({'is_following': is_following}, status=status.HTTP_200_OK)


class UserDirectoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        touch_presence(request.user)
        users = User.objects.exclude(id=request.user.id).select_related('presence').order_by('username')
        serializer = UserPreviewSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatRoomListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        return (
            ChatRoom.objects.filter(participants=request.user)
            .prefetch_related(
                Prefetch('participants', queryset=User.objects.select_related('presence').order_by('username'))
            )
            .distinct()
        )

    def get(self, request):
        touch_presence(request.user)
        serializer = ChatRoomSerializer(self.get_queryset(request), many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        touch_presence(request.user)
        participant_ids = request.data.get('participant_ids') or []
        name = (request.data.get('name') or '').strip()

        if not isinstance(participant_ids, list):
            return Response({'detail': 'participant_ids 형식이 올바르지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        ids = {int(value) for value in participant_ids if str(value).isdigit()}
        ids.add(request.user.id)
        participants = list(User.objects.filter(id__in=ids))

        if len(participants) < 2:
            return Response({'detail': '그룹 채팅에는 최소 2명의 참여자가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)

        room = ChatRoom.objects.create(name=name, is_group=True, created_by=request.user)
        room.participants.set(participants)
        serializer = ChatRoomSerializer(room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DirectChatRoomAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        touch_presence(request.user)
        target = get_object_or_404(User, username=username)

        if target.id == request.user.id:
            return Response({'detail': '본인과는 1:1 채팅을 만들 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        room = (
            ChatRoom.objects.filter(is_group=False, participants=request.user)
            .filter(participants=target)
            .annotate(participant_count=Count('participants'))
            .filter(participant_count=2)
            .first()
        )

        if room is None:
            room = ChatRoom.objects.create(is_group=False, created_by=request.user)
            room.participants.set([request.user, target])

        serializer = ChatRoomSerializer(room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatMessageListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def _room(self, request, room_id):
        return get_object_or_404(
            ChatRoom.objects.prefetch_related(
                Prefetch('participants', queryset=User.objects.select_related('presence').order_by('username'))
            ),
            id=room_id,
            participants=request.user,
        )

    def get(self, request, room_id):
        touch_presence(request.user)
        room = self._room(request, room_id)
        serializer = ChatMessageSerializer(room.messages.select_related('user').all(), many=True)
        return Response({'room': ChatRoomSerializer(room, context={'request': request}).data, 'messages': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, room_id):
        touch_presence(request.user)
        room = self._room(request, room_id)
        content = (request.data.get('content') or '').strip()
        if not content:
            return Response({'detail': '메시지를 입력하세요.'}, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.create(room=room, user=request.user, content=content)
        room.save(update_fields=['updated_at'])
        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'CSRF cookie set'}, status=status.HTTP_200_OK)

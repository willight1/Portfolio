from django.urls import path
from .views import (
    ChangePasswordAPIView,
    ChatMessageListCreateAPIView,
    ChatRoomListCreateAPIView,
    CSRFAPIView,
    DirectChatRoomAPIView,
    FollowersListAPIView,
    FollowingListAPIView,
    FollowStatusAPIView,
    FollowToggleAPIView,
    LoginAPIView,
    LogoutAPIView,
    MeAPIView,
    RegisterAPIView,
    UserDirectoryAPIView,
    WithdrawAPIView,
)

urlpatterns = [
    path('csrf/', CSRFAPIView.as_view(), name='api-csrf'),
    path('register/', RegisterAPIView.as_view(), name='api-register'),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('me/', MeAPIView.as_view(), name='api-me'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='api-change-password'),
    path('withdraw/', WithdrawAPIView.as_view(), name='api-withdraw'),

    path('following/', FollowingListAPIView.as_view(), name='api-following-list'),
    path('followers/', FollowersListAPIView.as_view(), name='api-followers-list'),
    path('follow/<str:username>/', FollowToggleAPIView.as_view(), name='api-follow-toggle'),
    path('follow/<str:username>/status/', FollowStatusAPIView.as_view(), name='api-follow-status'),
    path('users/', UserDirectoryAPIView.as_view(), name='api-user-directory'),
    path('chat/rooms/', ChatRoomListCreateAPIView.as_view(), name='api-chat-room-list-create'),
    path('chat/direct/<str:username>/', DirectChatRoomAPIView.as_view(), name='api-chat-direct-room'),
    path('chat/rooms/<int:room_id>/messages/', ChatMessageListCreateAPIView.as_view(), name='api-chat-messages'),
]

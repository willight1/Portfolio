from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import ChatMessage, ChatRoom, Follow


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('이미 사용 중인 username입니다.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': '비밀번호가 일치하지 않습니다.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserPreviewSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'followers_count', 'following_count', 'is_online', 'last_seen']

    def get_followers_count(self, obj):
        return obj.follower_relations.count()

    def get_following_count(self, obj):
        return obj.following_relations.count()

    def get_is_online(self, obj):
        presence = getattr(obj, 'presence', None)
        if not presence:
            return False
        return presence.last_seen >= timezone.now() - timedelta(minutes=5)

    def get_last_seen(self, obj):
        presence = getattr(obj, 'presence', None)
        return presence.last_seen if presence else None


class FollowSerializer(serializers.ModelSerializer):
    follower = UserPreviewSerializer(read_only=True)
    following = UserPreviewSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'room', 'user', 'username', 'content', 'created_at']
        read_only_fields = ['id', 'room', 'user', 'username', 'created_at']

    def get_username(self, obj):
        return obj.user.username


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserPreviewSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField(read_only=True)
    display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'name',
            'display_name',
            'is_group',
            'created_by',
            'participants',
            'last_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'participants', 'last_message', 'created_at', 'updated_at', 'display_name']

    def get_last_message(self, obj):
        message = obj.messages.select_related('user').order_by('-created_at').first()
        if not message:
            return None
        return ChatMessageSerializer(message).data

    def get_display_name(self, obj):
        if obj.is_group:
            return obj.name or f'그룹 채팅 #{obj.id}'

        request = self.context.get('request')
        me = getattr(request, 'user', None)
        others = obj.participants.exclude(id=getattr(me, 'id', None))
        other = others.first()
        return other.username if other else obj.name or '1:1 채팅'

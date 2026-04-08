from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Follow, OperatorNote
from .utils import generate_unique_username, get_user_account_label, get_user_display_name, get_user_nickname, get_user_real_name


class RegisterSerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(write_only=True, max_length=150)
    name = serializers.CharField(write_only=True, max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['nickname', 'name', 'password', 'password_confirm']

    def validate_nickname(self, value):
        nickname = value.strip()
        if not nickname:
            raise serializers.ValidationError('별명을 입력해주세요.')
        if User.objects.filter(last_name=nickname).exists():
            raise serializers.ValidationError('이미 사용 중인 별명입니다.')
        return nickname

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError('이름을 입력해주세요.')
        return name

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': '비밀번호가 일치하지 않습니다.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        nickname = validated_data.pop('nickname').strip()
        name = validated_data.pop('name').strip()
        password = validated_data.pop('password')
        user = User(username=generate_unique_username(nickname), first_name=name, last_name=nickname)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(source='last_name', max_length=150)
    name = serializers.CharField(source='first_name', max_length=150)
    account_label = serializers.SerializerMethodField(read_only=True)
    display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'nickname', 'name', 'account_label', 'display_name']
        read_only_fields = ['username', 'account_label', 'display_name']

    def validate_last_name(self, value):
        nickname = value.strip()
        if not nickname:
            raise serializers.ValidationError('별명을 입력해주세요.')
        queryset = User.objects.filter(last_name=nickname)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('이미 사용 중인 별명입니다.')
        return nickname

    def validate_first_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError('이름을 입력해주세요.')
        return name

    def get_account_label(self, obj):
        return get_user_account_label(obj)

    def get_display_name(self, obj):
        return get_user_display_name(obj)


class UserPreviewSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    nickname = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    account_label = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nickname', 'name', 'account_label', 'display_name', 'followers_count', 'following_count']

    def get_followers_count(self, obj):
        return obj.follower_relations.count()

    def get_following_count(self, obj):
        return obj.following_relations.count()

    def get_nickname(self, obj):
        return get_user_nickname(obj)

    def get_name(self, obj):
        return get_user_real_name(obj)

    def get_account_label(self, obj):
        return get_user_account_label(obj)

    def get_display_name(self, obj):
        return get_user_display_name(obj)


class FollowSerializer(serializers.ModelSerializer):
    follower = UserPreviewSerializer(read_only=True)
    following = UserPreviewSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']


class OperatorNoteSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)
    account_label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OperatorNote
        fields = ['id', 'user', 'username', 'account_label', 'title', 'content', 'status', 'admin_reply', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'username', 'account_label', 'status', 'admin_reply', 'created_at', 'updated_at']

    def get_username(self, obj):
        return obj.user.username

    def get_account_label(self, obj):
        return get_user_account_label(obj.user)

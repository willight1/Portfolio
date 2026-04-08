from urllib.parse import quote, urlsplit, urlunsplit

from rest_framework import serializers

from apps.accounts.utils import get_user_account_label, get_user_display_name
from .models import Comment, CommentLike, Post, PostLike, Project


def to_safe_absolute_url(request, raw_url: str) -> str:
    split = urlsplit(raw_url)
    encoded_path = quote(split.path)
    encoded_url = urlunsplit((split.scheme, split.netloc, encoded_path, split.query, split.fragment))
    if split.scheme and split.netloc:
        return encoded_url
    return request.build_absolute_uri(encoded_url)


class ProjectSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField(read_only=True)
    tech_stack_list = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'slug',
            'short_description',
            'description',
            'thumbnail',
            'thumbnail_url',
            'tech_stack',
            'tech_stack_list',
            'github_url',
            'demo_url',
            'is_featured',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return to_safe_absolute_url(request, obj.thumbnail.url)
        return None

    def get_tech_stack_list(self, obj):
        return obj.tech_stack_list


class PostSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField(read_only=True)
    tags_list = serializers.SerializerMethodField(read_only=True)
    likes_count = serializers.SerializerMethodField(read_only=True)
    is_liked = serializers.SerializerMethodField(read_only=True)
    created_by_username = serializers.SerializerMethodField(read_only=True)
    created_by_display_name = serializers.SerializerMethodField(read_only=True)
    created_by_account_label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'source_url',
            'is_public',
            'thumbnail',
            'thumbnail_url',
            'tags',
            'tags_list',
            'likes_count',
            'is_liked',
            'created_by',
            'created_by_username',
            'created_by_display_name',
            'created_by_account_label',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_by', 'created_at', 'updated_at']

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return to_safe_absolute_url(request, obj.thumbnail.url)
        return None

    def get_tags_list(self, obj):
        return obj.tags_list

    def get_likes_count(self, obj):
        return obj.likes_count

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return PostLike.objects.filter(post=obj, user=request.user).exists()

    def get_created_by_username(self, obj):
        return obj.created_by.username if obj.created_by else None

    def get_created_by_display_name(self, obj):
        return get_user_display_name(obj.created_by) if obj.created_by else None

    def get_created_by_account_label(self, obj):
        return get_user_account_label(obj.created_by) if obj.created_by else None


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)
    display_name = serializers.SerializerMethodField(read_only=True)
    account_label = serializers.SerializerMethodField(read_only=True)
    likes_count = serializers.SerializerMethodField(read_only=True)
    is_liked = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'user',
            'username',
            'display_name',
            'account_label',
            'content',
            'likes_count',
            'is_liked',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'post', 'user', 'username', 'display_name', 'account_label', 'likes_count', 'is_liked', 'created_at', 'updated_at']

    def get_username(self, obj):
        return obj.user.username

    def get_display_name(self, obj):
        return get_user_display_name(obj.user)

    def get_account_label(self, obj):
        return get_user_account_label(obj.user)

    def get_likes_count(self, obj):
        return obj.likes_count

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return CommentLike.objects.filter(comment=obj, user=request.user).exists()

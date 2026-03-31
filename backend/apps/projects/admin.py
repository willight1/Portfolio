from django.contrib import admin
from django.utils.html import format_html

from .models import Comment, CommentLike, Post, PostLike, Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'is_featured', 'thumbnail_preview', 'created_at')
    list_filter = ('is_featured', 'created_at')
    search_fields = ('title', 'short_description', 'tech_stack')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('thumbnail_preview', 'created_at', 'updated_at')

    fieldsets = (
        ('Basic', {'fields': ('title', 'slug', 'short_description', 'description')}),
        ('Media/Links', {'fields': ('thumbnail', 'thumbnail_preview', 'github_url', 'demo_url')}),
        ('Extra', {'fields': ('tech_stack', 'is_featured')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:60px;border-radius:8px;" />', obj.thumbnail.url)
        return '-'

    thumbnail_preview.short_description = 'Thumbnail'


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'likes_count', 'thumbnail_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'excerpt', 'tags')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('thumbnail_preview', 'created_at', 'updated_at')

    fieldsets = (
        ('Basic', {'fields': ('title', 'slug', 'excerpt', 'content')}),
        ('Media', {'fields': ('thumbnail', 'thumbnail_preview')}),
        ('Meta', {'fields': ('tags', 'created_by')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:60px;border-radius:8px;" />', obj.thumbnail.url)
        return '-'

    thumbnail_preview.short_description = 'Thumbnail'


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'created_at')
    search_fields = ('post__title', 'user__username')
    list_filter = ('created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'likes_count', 'created_at')
    search_fields = ('post__title', 'user__username', 'content')
    list_filter = ('created_at',)


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'comment', 'user', 'created_at')
    search_fields = ('comment__post__title', 'user__username')
    list_filter = ('created_at',)

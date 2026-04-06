from django.contrib.auth.models import User
from django.db import models
from django.utils.text import slugify


class Project(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220, blank=True)
    short_description = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='projects/thumbnails/', blank=True, null=True)
    # 초보자 친화적으로 CSV 문자열로 저장 (예: "Django,Next.js,Tailwind")
    tech_stack = models.CharField(max_length=255, blank=True)
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            if not base_slug:
                base_slug = f'project-{self.pk or ""}'.strip('-') or 'project'
            slug_candidate = base_slug
            counter = 1
            while Project.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                counter += 1
                slug_candidate = f'{base_slug}-{counter}'
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    @property
    def tech_stack_list(self):
        if not self.tech_stack:
            return []
        return [item.strip() for item in self.tech_stack.split(',') if item.strip()]

    def __str__(self):
        return self.title


class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220, blank=True)
    excerpt = models.CharField(max_length=255)
    content = models.TextField()
    source_url = models.URLField(blank=True)
    is_public = models.BooleanField(default=True)
    thumbnail = models.ImageField(upload_to='posts/thumbnails/', blank=True, null=True)
    # CSV 형식 태그 (예: "django,python,portfolio")
    tags = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            if not base_slug:
                base_slug = f'post-{self.pk or ""}'.strip('-') or 'post'
            slug_candidate = base_slug
            counter = 1
            while Post.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                counter += 1
                slug_candidate = f'{base_slug}-{counter}'
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    @property
    def tags_list(self):
        if not self.tags:
            return []
        return [item.strip() for item in self.tags.split(',') if item.strip()]

    @property
    def likes_count(self):
        return self.likes.count()

    def __str__(self):
        return self.title


class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_posts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='unique_post_like'),
        ]

    def __str__(self):
        return f'{self.user.username} likes {self.post.title}'


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def likes_count(self):
        return self.likes.count()

    def __str__(self):
        return f'{self.user.username} - {self.post.title}'


class CommentLike(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['comment', 'user'], name='unique_comment_like'),
        ]

    def __str__(self):
        return f'{self.user.username} likes comment#{self.comment.id}'

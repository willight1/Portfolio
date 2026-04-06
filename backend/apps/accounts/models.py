from django.contrib.auth.models import User
from django.db import models


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_relations')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_relations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_follow_relation'),
            models.CheckConstraint(check=~models.Q(follower=models.F('following')), name='prevent_self_follow'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.follower.username} -> {self.following.username}'


class OperatorNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='operator_notes')
    title = models.CharField(max_length=120)
    content = models.TextField()
    status = models.CharField(max_length=20, default='pending')
    admin_reply = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']

    def __str__(self):
        return f'{self.user.username} note: {self.title}'

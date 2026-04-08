from django.db import migrations, models


def populate_guest_nicknames(apps, schema_editor):
    Comment = apps.get_model('projects', 'Comment')

    for comment in Comment.objects.select_related('user').all():
        if comment.user_id and not comment.guest_nickname:
            nickname = (comment.user.last_name or '').strip() or (comment.user.first_name or '').strip() or comment.user.username
            comment.guest_nickname = nickname[:80]
            comment.save(update_fields=['guest_nickname'])


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0006_post_view_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='author_ip',
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='comment',
            name='guest_nickname',
            field=models.CharField(default='익명', max_length=80),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='comment',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name='comments', to='auth.user'),
        ),
        migrations.RunPython(populate_guest_nicknames, migrations.RunPython.noop),
    ]

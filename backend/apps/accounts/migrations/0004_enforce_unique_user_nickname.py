from django.db import migrations


def normalize_user_nicknames(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    seen = set()

    for user in User.objects.order_by('id'):
        nickname = (user.last_name or '').strip()
        if not nickname:
            nickname = (user.username or '').strip() or f'user_{user.id}'

        base = nickname
        suffix = 1
        while nickname in seen:
            nickname = f'{base}_{suffix}'
            suffix += 1

        if user.last_name != nickname:
            user.last_name = nickname
            user.save(update_fields=['last_name'])

        seen.add(nickname)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_ensure_operatornote_table'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(normalize_user_nicknames, migrations.RunPython.noop),
        migrations.RunSQL(
            sql='CREATE UNIQUE INDEX IF NOT EXISTS accounts_user_last_name_uniq ON auth_user (last_name);',
            reverse_sql='DROP INDEX IF EXISTS accounts_user_last_name_uniq;',
        ),
    ]

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0004_post_source_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='is_public',
            field=models.BooleanField(default=True),
        ),
    ]

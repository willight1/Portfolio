from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_post_is_public'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='view_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ]

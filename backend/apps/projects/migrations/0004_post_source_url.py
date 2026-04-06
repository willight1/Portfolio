from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_comment_commentlike'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='source_url',
            field=models.URLField(blank=True),
        ),
    ]

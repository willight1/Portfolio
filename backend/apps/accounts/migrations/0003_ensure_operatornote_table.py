from django.db import migrations


def ensure_operatornote_table(apps, schema_editor):
    OperatorNote = apps.get_model('accounts', 'OperatorNote')
    existing_tables = set(schema_editor.connection.introspection.table_names())

    if OperatorNote._meta.db_table in existing_tables:
        return

    schema_editor.create_model(OperatorNote)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_userpresence_chatroom_chatmessage'),
    ]

    operations = [
        migrations.RunPython(ensure_operatornote_table, migrations.RunPython.noop),
    ]

from django.contrib.auth.models import User
from django.utils.text import slugify


def get_user_nickname(user: User) -> str:
    return (user.last_name or '').strip()


def get_user_real_name(user: User) -> str:
    return (user.first_name or '').strip()


def get_user_display_name(user: User) -> str:
    return get_user_nickname(user) or get_user_real_name(user) or user.username


def get_user_account_label(user: User) -> str:
    nickname = get_user_nickname(user)
    if nickname:
        return f'{nickname}({user.username})'
    return user.username


def generate_unique_username(nickname: str) -> str:
    base = slugify(nickname, allow_unicode=True).replace('-', '_').strip('._')
    if not base:
        base = 'user'

    candidate = base[:150]
    suffix = 1

    while User.objects.filter(username=candidate).exists():
        suffix_text = f'_{suffix}'
        candidate = f'{base[:150 - len(suffix_text)]}{suffix_text}'
        suffix += 1

    return candidate

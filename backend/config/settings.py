import os
from importlib.util import find_spec
from pathlib import Path

from dotenv import load_dotenv

try:
    import dj_database_url
except ImportError:  # 배포 의존성이 로컬에 아직 없을 수 있음
    dj_database_url = None

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).lower() in ['1', 'true', 'yes', 'on']


def env_list(name: str, default: str = '') -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(',') if item.strip()]


SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'change-me-in-production')
DEBUG = env_bool('DJANGO_DEBUG', True)
ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost')

USE_S3 = env_bool('USE_S3', False)
WHITENOISE_AVAILABLE = find_spec('whitenoise') is not None
STORAGES_AVAILABLE = find_spec('storages') is not None

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'apps.projects',
    'apps.accounts',
]

if USE_S3 and STORAGES_AVAILABLE:
    INSTALLED_APPS.append('storages')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if WHITENOISE_AVAILABLE:
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

database_url = os.getenv('DATABASE_URL', '').strip() or f'sqlite:///{BASE_DIR / "db.sqlite3"}'
if dj_database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            database_url,
            conn_max_age=600,
            ssl_require=not DEBUG and not database_url.startswith('sqlite'),
        )
    }
else:
    # dj-database-url 미설치 환경 fallback (로컬 개발용)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    },
}

if WHITENOISE_AVAILABLE:
    STORAGES['staticfiles']['BACKEND'] = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

if USE_S3 and STORAGES_AVAILABLE:
    AWS_ACCESS_KEY_ID = os.getenv('SUPABASE_S3_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY = os.getenv('SUPABASE_S3_SECRET_ACCESS_KEY', '')
    AWS_STORAGE_BUCKET_NAME = os.getenv('SUPABASE_S3_BUCKET_NAME', 'portfolio-media')
    AWS_S3_REGION_NAME = 'ap-south-1'
    AWS_S3_ENDPOINT_URL = 'https://csiwpekpqakitvqdqaxw.supabase.co/storage/v1/s3'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = False
    AWS_DEFAULT_ACL = 'public-read'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}

    STORAGES['default'] = {
        'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
        'OPTIONS': {
            'access_key': AWS_ACCESS_KEY_ID,
            'secret_key': AWS_SECRET_ACCESS_KEY,
            'bucket_name': AWS_STORAGE_BUCKET_NAME,
            'region_name': AWS_S3_REGION_NAME,
            'endpoint_url': AWS_S3_ENDPOINT_URL,
            'default_acl': AWS_DEFAULT_ACL,
            'file_overwrite': AWS_S3_FILE_OVERWRITE,
            'querystring_auth': AWS_QUERYSTRING_AUTH,
            'object_parameters': AWS_S3_OBJECT_PARAMETERS,
        },
    }
    MEDIA_URL = (
        f'https://csiwpekpqakitvqdqaxw.supabase.co/storage/v1/object/public/'
        f'{AWS_STORAGE_BUCKET_NAME}/'
    )

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.accounts.authentication.CsrfExemptSessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

FRONTEND_ORIGINS = env_list('FRONTEND_ORIGINS', 'http://localhost:3000')
CORS_ALLOWED_ORIGINS = FRONTEND_ORIGINS
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = FRONTEND_ORIGINS

# Vercel preview/production subdomain 지원 (예: https://xxx.vercel.app)
VERCEL_ORIGIN_REGEX = os.getenv('VERCEL_ORIGIN_REGEX', r'^https://.*\.vercel\.app$')
CORS_ALLOWED_ORIGIN_REGEXES = [VERCEL_ORIGIN_REGEX]
CSRF_TRUSTED_ORIGINS += ['https://*.vercel.app']

SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'Lax')
CSRF_COOKIE_SAMESITE = os.getenv('CSRF_COOKIE_SAMESITE', 'Lax')
SESSION_COOKIE_SECURE = env_bool('SESSION_COOKIE_SECURE', not DEBUG)
CSRF_COOKIE_SECURE = env_bool('CSRF_COOKIE_SECURE', not DEBUG)

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', True)

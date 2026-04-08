from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import include, path


def root_entry(request):
    frontend_url = settings.FRONTEND_ORIGINS[0] if settings.FRONTEND_ORIGINS else ''
    if frontend_url:
        return redirect(frontend_url)
    return JsonResponse({'detail': 'Portfolio backend is running.'}, status=200)


urlpatterns = [
    path('', root_entry, name='root-entry'),
    path('admin/', admin.site.urls),
    path('api/', include('apps.projects.urls')),
    path('api/auth/', include('apps.accounts.urls')),
]

if not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

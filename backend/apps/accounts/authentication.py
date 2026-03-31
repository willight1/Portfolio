from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Cross-site (Vercel <-> Render) 환경에서 API 호출 시
    CSRF 검증으로 인한 403을 피하기 위한 인증 클래스.
    """

    def enforce_csrf(self, request):
        return

# Portfolio Fullstack (Django + Next.js)

Django API + Next.js 프론트 기반 포트폴리오/게시글 서비스입니다.

- Backend: Django + DRF + Session Auth
- Frontend: Next.js(App Router) + Tailwind
- 기능: 회원/게시글/좋아요/댓글/댓글좋아요/팔로우

## 1) 로컬 실행

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py create_admin --username admin --email admin@example.com --password 'admin1234!'
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

접속:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Admin: `http://localhost:8000/admin`

---

## 2) 배포 (Render + Vercel)

### A. Backend (Render)

이 저장소에는 Render용 설정 파일이 이미 있습니다:
- `/render.yaml`
- `/backend/Procfile`

#### 방법 1: Blueprint 배포 (권장)
1. Render에서 `New +` → `Blueprint`
2. 이 저장소 연결
3. `render.yaml` 인식 후 web + postgres가 자동 생성됨

#### 방법 2: 수동 배포
1. `New Web Service` 생성
2. Root Directory: `backend`
3. Build Command:
```bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```
4. Start Command:
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3
```

#### Render 환경변수(필수)
- `DJANGO_SECRET_KEY` (강한 랜덤 문자열)
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=your-backend.onrender.com`
- `DATABASE_URL` (Render Postgres 연결 문자열)
- `FRONTEND_ORIGINS=https://your-frontend.vercel.app`
- `SESSION_COOKIE_SAMESITE=None`
- `CSRF_COOKIE_SAMESITE=None`
- `SESSION_COOKIE_SECURE=True`
- `CSRF_COOKIE_SECURE=True`
- `SECURE_SSL_REDIRECT=True`

### B. Frontend (Vercel)

1. Vercel에서 `New Project`
2. Root Directory를 `frontend`로 지정
3. 환경변수 추가:
- `NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com`
- `NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app`
4. 배포

### C. CORS/CSRF 연결 확인

Django `FRONTEND_ORIGINS`에 Vercel 도메인이 정확히 들어가야 로그인/세션이 동작합니다.

예:
```env
FRONTEND_ORIGINS=https://your-frontend.vercel.app
```

---

## 3) Media(이미지) 배포

현재 코드는 로컬 파일 저장 + S3 옵션을 같이 지원합니다.

### 로컬 저장(기본)
- 개발에 적합
- Render 재배포 시 파일 유실 가능

### S3 사용(운영 권장)
`backend/.env`에 다음 설정:
```env
USE_S3=True
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=...
AWS_S3_REGION_NAME=ap-northeast-2
AWS_S3_CUSTOM_DOMAIN=your-bucket.s3.ap-northeast-2.amazonaws.com
```

---

## 4) 현재 권한 정책

- 비로그인
  - 홈 게시글 목록 조회 가능
  - 상세 접근 불가(알림 후 홈 유지)
- 로그인
  - 게시글 작성 가능
  - 본인 게시글만 수정/삭제 가능 (staff 예외 허용)
  - 댓글/댓글좋아요 가능
  - 팔로우/팔로잉/팔로워 기능 사용 가능

---

## 5) 주요 API

### Auth
- `GET /api/auth/csrf/`
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `POST /api/auth/change-password/`
- `POST /api/auth/withdraw/`

### Follow
- `GET /api/auth/following/`
- `GET /api/auth/followers/`
- `GET /api/auth/follow/<username>/status/`
- `POST /api/auth/follow/<username>/`
- `DELETE /api/auth/follow/<username>/`

### Posts
- `GET /api/posts/`
- `GET /api/posts/<slug>/` (로그인 필요)
- `POST /api/posts/` (로그인)
- `PUT /api/posts/<id>/` (작성자/staff)
- `DELETE /api/posts/<id>/` (작성자/staff)
- `POST /api/posts/<id>/like/`

### Comments
- `GET /api/posts/<post_id>/comments/`
- `POST /api/posts/<post_id>/comments/`
- `PATCH /api/comments/<id>/`
- `DELETE /api/comments/<id>/`
- `POST /api/comments/<id>/like/`
# Portfolio

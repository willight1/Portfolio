# Portfolio Fullstack (Django + Next.js)

현재 기준 가장 쉬운 배포 방식:
- Backend: Railway (Django + Postgres)
- Frontend: Vercel (Next.js)

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

---

## 2) 배포 방식 (권장)

### A. Railway 백엔드 배포

저장소 루트에 `railway.json`이 이미 있습니다.

#### Railway에서 할 일
1. Railway 로그인
2. `New Project` → `Deploy from GitHub repo`
3. 저장소 선택: `willight1/Portfolio`
4. 배포 시작

#### 서비스 설정 확인
- Start command는 `railway.json`이 자동 적용
- Port는 Railway가 자동 주입

#### Postgres 연결
1. Railway 프로젝트에서 `New` → `Database` → `PostgreSQL`
2. 백엔드 서비스 `Variables`에서 `DATABASE_URL`이 연결되었는지 확인

#### Backend 환경변수
Railway 백엔드 서비스 Variables에 아래 입력:
```env
DJANGO_SECRET_KEY=강한_랜덤_문자열
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<railway-백엔드-도메인>
FRONTEND_ORIGINS=https://<vercel-프론트-도메인>

SESSION_COOKIE_SAMESITE=None
CSRF_COOKIE_SAMESITE=None
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True

USE_S3=False
```

#### 관리자 계정 생성
Railway Shell에서:
```bash
cd backend
python manage.py create_admin --username admin --email admin@example.com --password 'admin1234!'
```

### B. Vercel 프론트 배포

1. Vercel 로그인
2. `Add New` → `Project`
3. 같은 GitHub repo 선택
4. `Root Directory`를 `frontend`로 설정
5. Environment Variables 추가:
```env
NEXT_PUBLIC_API_BASE_URL=https://<railway-백엔드-도메인>
NEXT_PUBLIC_SITE_URL=https://<vercel-프론트-도메인>
```
6. Deploy

### C. 마지막 연결
- Railway `FRONTEND_ORIGINS`를 실제 Vercel 도메인으로 맞춤
- Railway 재배포

---

## 3) 권한 정책

- 비로그인
  - 홈 게시글 목록 조회 가능
  - 프로젝트/게시글 상세 조회 가능
- 로그인
  - 게시글 작성 가능
  - 본인 게시글만 수정/삭제 가능 (staff 예외)
  - 댓글/댓글좋아요 가능
  - 팔로우/팔로잉/팔로워 기능 사용 가능

---

## 4) 주요 API

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
- `GET /api/posts/author/<username>/`
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

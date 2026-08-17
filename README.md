# Online Learning & Tutor Platform (MVP)

ระบบสอนออนไลน์ครบวงจรสำหรับครูและนักเรียน

## 📋 Features

### Public Website
- 🏠 Homepage
- 📚 Course Listing
- 📖 Course Detail
- 📝 Subjects
- 👨‍🏫 Teachers
- 📄 About
- 📧 Contact
- 🔐 Login/Register
- 🔑 Forgot/Reset Password

### Student Dashboard
- 📊 Overview
- 📖 My Courses
- 📝 Browse Courses
- 📚 Course Detail
- 📄 Materials
- 📝 Quiz/Exam
- 📊 Scores & Progress
- 💳 Payments
- 🎥 Live Classes
- 🔔 Notifications
- 👤 Profile

### Teacher Dashboard
- 📊 Overview
- 📖 My Courses
- ✏️ Create Course
- 📄 Materials Management
- 📝 Quiz Management
- 📋 Exam Management
- 📑 Assignment Management
- 📥 Submissions
- 📊 Gradebook
- 👥 Students
- 🎥 Live Classes
- 🔔 Notifications
- 👤 Profile

### Admin Dashboard
- 📊 Overview
- ✅ Teacher Approval
- ✅ Course Approval
- 📝 Subject Management
- 🎫 Coupon Management
- 👥 User Management
- 📢 Announcement Management
- 📧 Contact Messages
- 🔔 Notifications
- 👤 Profile

## 🛠️ Tech Stack

### Backend
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT Authentication + Refresh Tokens
- BCrypt
- Multer (file upload)
- Pluggable Storage (Local / S3-compatible)

### Frontend
- React 18 (TypeScript)
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- ShadCN UI
- Lucide Icons

## 🚀 Getting Started

### Development (Local) - Windows PowerShell

**Prerequisites:** Node.js 20+, PostgreSQL 16 (or Docker)

1. **Start PostgreSQL** (choose one)
   ```powershell
   # Docker
   docker compose up -d postgres

   # Or install PostgreSQL locally and create database `study_platform`
   ```

2. **Configure backend**
   ```powershell
   cd backend
   copy .env.example .env
   # Edit DATABASE_URL if needed (default: postgresql://postgres:password@localhost:5432/study_platform)
   npm install
   npx prisma db push
   npm run prisma:seed
   ```

3. **Install frontend**
   ```powershell
   cd ..\frontend
   npm install
   ```

4. **Run app (single port)**
   ```powershell
   npm run dev
   ```
   Opens **http://localhost:5000** — API + website together. Frontend auto-rebuilds on save (refresh browser to see changes).

   Optional HMR dev (two ports): `npm run dev:split` → UI on 5173, API on 5000.

5. **API docs:** http://localhost:5000/api/docs

**Demo accounts** (after seed): `admin@example.com` / `admin1234`, `teacher@example.com` / `teacher1234`, `student@example.com` / `student1234`

**Demo coupon:** `DEMO10` (10% off paid courses)

New registrations require a strong password (8+ chars, upper, lower, number).

### File Storage Configuration

- Default (local): `STORAGE_PROVIDER=local` stores files at `backend/uploads`
- S3-compatible:
  - Set `STORAGE_PROVIDER=s3`
  - Configure `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- Optional `S3_ENDPOINT` for MinIO/R2/other compatible providers
- Optional `S3_PUBLIC_URL` to serve files via CDN/custom domain

Signed URL APIs (teacher):
- `POST /teacher/storage/signed-upload` `{ folder, fileName, contentType }`
- `POST /teacher/storage/signed-download` `{ fileUrl }`

### Observability
- Health: `GET /health`, `GET /health/live`, `GET /health/ready`
- Metrics: `GET /health/metrics`
- Backend structured logs include `requestId`, method, path, status, duration
- Optional Sentry: set `SENTRY_DSN` (backend) / `VITE_SENTRY_DSN` (frontend)

### Backup / Restore
- See `docs/BACKUP_RESTORE.md`
- Local shortcut: `cd backend ; npm run db:backup`

### Tests
```powershell
cd backend
npm test                  # unit tests
npm run test:integration  # auth + health (requires PostgreSQL)
npm run e2e:smoke         # API smoke tests (backend must be running on :5000)

# UI smoke (Playwright) — requires npm run dev or backend serving frontend/dist
cd ..\frontend
npm run test:e2e
```

From repo root:
```powershell
npm run e2e:smoke   # API smoke
npm run e2e:ui      # Playwright UI smoke
```

### Production (Docker Compose)

1. **Build and start containers**
   ```powershell
   docker compose up --build
   ```

2. **Access**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

### Deploy to the internet (Render)

โปรเจกต์พร้อมขึ้นเว็บจาก GitHub แล้ว กดลิงก์นี้แล้วล็อกอินด้วย GitHub:

**https://render.com/deploy?repo=https://github.com/ruttinon/leaning**

1. กด **Apply** ให้สร้างเว็บ `edupro` กับฐานข้อมูล PostgreSQL **แบบฟรี**
2. ถ้าหน้าจอยังขึ้นให้จ่ายเงิน ให้เลือกแผน **Free** ทั้งเว็บและฐานข้อมูล อย่าเลือก Starter
3. รอ build ครั้งแรกประมาณ 5–10 นาที
4. เปิด URL ที่ Render ให้ เช่น `https://edupro.onrender.com`

บัญชีทดลองชุดเดียวกับเครื่องตัวเอง:
- `student@example.com` / `student1234`
- `teacher@example.com` / `teacher1234`
- `admin@example.com` / `admin1234`

แผนฟรีจะหลับหลังไม่เข้าประมาณ 15 นาที (ครั้งแรกที่เปิดใหม่จะช้าหน่อย) และฐานข้อมูลฟรีมีอายุ 30 วัน

ครั้งถัดไปแค่ `git push` ขึ้น `main` เว็บจะอัปเดตเอง

## 📁 Project Structure
```
study/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── public/
│   │   ├── admin/
│   │   ├── teacher/
│   │   └── student/
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── common/
│   │   ├── layouts/
│   │   └── lib/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

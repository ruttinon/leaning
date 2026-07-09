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
- 🎥 Live Classes (Coming Soon)
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
- 🔔 Notifications
- 👤 Profile

## 🛠️ Tech Stack

### Backend
- NestJS (TypeScript)
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT Authentication
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

1. **Install dependencies**
   ```powershell
   cd backend ; npm install ; npm run prisma:generate
   cd ..\frontend ; npm install
   ```

2. **Run backend**
   ```powershell
   cd backend ; npm run dev
   ```

3. **Run frontend** (in a new terminal)
   ```powershell
   cd frontend ; npm run dev
   ```

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

### Production (Docker Compose)

1. **Build and start containers**
   ```powershell
   docker compose up --build
   ```

2. **Access**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

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

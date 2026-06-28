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

# Database Backup / Restore Runbook

## Local (SQLite)

### Backup
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\backup-db.ps1
```

### Restore
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\restore-db.ps1 -BackupFile .\backups\dev-YYYYMMDD-HHMMSS.db
```

Notes:
- Restore จะสร้างไฟล์ safety backup อัตโนมัติก่อนเขียนทับ `prisma/dev.db`
- ไฟล์ backup เก็บที่ `backend/backups/`

## Production (PostgreSQL)

### Backup
```bash
pg_dump "$DATABASE_URL" -Fc -f "backup-$(date +%Y%m%d-%H%M%S).dump"
```

### Restore
```bash
pg_restore --clean --if-exists -d "$DATABASE_URL" backup-YYYYMMDD-HHMMSS.dump
```

## Verification Checklist
1. รัน backup สำเร็จ และมีไฟล์ถูกสร้าง
2. ทดสอบ restore บน environment ที่ไม่ใช่ production ก่อน
3. ตรวจ `/health/ready` หลัง restore ต้องได้ `status=ready`
4. Login ด้วย demo accounts ได้ตามปกติ
5. ตรวจจำนวน courses/enrollments ว่าตรงคาด

## NPM shortcuts
```powershell
cd backend
npm run db:backup
npm run db:restore -- .\backups\dev-YYYYMMDD-HHMMSS.db
```

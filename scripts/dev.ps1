# Dev helper: free port 5000 if a stale backend is still running
$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  Write-Host "Stopping process on port 5000 (PID $($conn.OwningProcess))..."
  Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
}

Write-Host "Starting backend and frontend..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; npm run dev'
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev'

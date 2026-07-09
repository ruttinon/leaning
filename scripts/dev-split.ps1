# Optional: separate Vite (5173) + API (5000) for hot module reload
$RootDir = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RootDir 'backend'
$FrontendDir = Join-Path $RootDir 'frontend'

$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  Write-Host "Stopping process on port 5000 (PID $($conn.OwningProcess))..."
  Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
}

Write-Host "Starting backend (5000) + Vite dev server (5173)..."
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$BackendDir'; `$env:PORT='5000'; npm run dev"
)
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$FrontendDir'; npm run dev"
)
Write-Host "Frontend: http://localhost:5173 | API: http://localhost:5000"

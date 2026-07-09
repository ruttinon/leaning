# Single-port dev: build frontend + serve everything on http://localhost:5000
$RootDir = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RootDir 'backend'
$FrontendDir = Join-Path $RootDir 'frontend'

foreach ($port in @(5000, 5173)) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) {
    Write-Host "Stopping process on port $port (PID $($conn.OwningProcess))..."
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "Building frontend..."
Push-Location $FrontendDir
npm run build
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  exit $LASTEXITCODE
}
Pop-Location

Write-Host "Starting frontend watch (auto-rebuild on save)..."
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-WindowStyle', 'Minimized',
  '-Command',
  "Set-Location '$FrontendDir'; npx vite build --watch"
) | Out-Null

Write-Host ""
Write-Host "EduPro: http://localhost:5000"
Write-Host "Swagger: http://localhost:5000/api/docs"
Write-Host ""
Write-Host "Press Ctrl+C to stop the backend. Refresh the browser after frontend rebuilds."
Write-Host ""

Set-Location $BackendDir
$env:PORT = '5000'
npm run dev

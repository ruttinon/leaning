param(
  [string]$BackupDir = ""
)

$ErrorActionPreference = "Stop"
$backendRoot = Split-Path -Parent $PSScriptRoot
$prismaDir = Join-Path $backendRoot "prisma"
$dbPath = Join-Path $prismaDir "dev.db"

if (-not (Test-Path $dbPath)) {
  throw "Database file not found: $dbPath"
}

if ([string]::IsNullOrWhiteSpace($BackupDir)) {
  $BackupDir = Join-Path $backendRoot "backups"
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$destination = Join-Path $BackupDir "dev-$timestamp.db"
Copy-Item -Path $dbPath -Destination $destination -Force

Write-Host "Backup created: $destination"
Write-Output $destination

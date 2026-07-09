param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$backendRoot = Split-Path -Parent $PSScriptRoot
$prismaDir = Join-Path $backendRoot "prisma"
$dbPath = Join-Path $prismaDir "dev.db"

if (-not (Test-Path $BackupFile)) {
  throw "Backup file not found: $BackupFile"
}

$safetyBackupDir = Join-Path $backendRoot "backups"
New-Item -ItemType Directory -Force -Path $safetyBackupDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safetyBackup = Join-Path $safetyBackupDir "pre-restore-$timestamp.db"

if (Test-Path $dbPath) {
  Copy-Item -Path $dbPath -Destination $safetyBackup -Force
  Write-Host "Safety backup created: $safetyBackup"
}

Copy-Item -Path $BackupFile -Destination $dbPath -Force
Write-Host "Database restored from: $BackupFile"
Write-Host "Active DB: $dbPath"

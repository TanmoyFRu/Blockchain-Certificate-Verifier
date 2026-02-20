$env:PATH += ";$env:APPDATA\Python\Scripts"

Write-Host "--------------------------------------------------" -ForegroundColor Magenta
Write-Host "   Blockchain Certificate Verifier Runner" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Magenta

# Check and potentially download MinIO
if (-not (Test-Path "$PSScriptRoot/backend/minio_server/minio.exe")) {
    Write-Host "Downloading MinIO Server..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot/backend/minio_server" | Out-Null
    Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile "$PSScriptRoot/backend/minio_server/minio.exe"
}

# Update .env to ensure local MinIO usage
$envFile = "$PSScriptRoot/backend/.env"
if (Test-Path $envFile) {
    (Get-Content $envFile) -replace "MINIO_ENDPOINT=play.min.io:9000", "MINIO_ENDPOINT=127.0.0.1:9000" | Set-Content $envFile
}

# Start MinIO
$minioJob = Start-Job -Name "BCV_MinIO" -ScriptBlock {
    $env:MINIO_ROOT_USER = "minioadmin"
    $env:MINIO_ROOT_PASSWORD = "minioadmin"
    & "$using:PSScriptRoot/backend/minio_server/minio.exe" server "$using:PSScriptRoot/backend/minio_data" --console-address ":9001"
}

# Start Backend in Background Job
$backendJob = Start-Job -Name "BCV_Backend" -ScriptBlock {
    cd "$using:PSScriptRoot/backend"
    $env:PATH += ";$env:APPDATA\Python\Scripts"
    poetry run uvicorn app.main:app --reload --port 8000
}

# Start Frontend in Background Job
$frontendJob = Start-Job -Name "BCV_Frontend" -ScriptBlock {
    cd "$using:PSScriptRoot/frontend"
    npm run dev -- --port 3000
}

Write-Host "[+] MinIO starting on http://127.0.0.1:9000 (Console: :9001)" -ForegroundColor Yellow
Write-Host "[+] Backend starting on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "[+] Frontend starting on http://localhost:3000" -ForegroundColor Green
Write-Host "Streaming logs in this terminal... (Press Ctrl+C to stop services)" -ForegroundColor Gray
Write-Host "--------------------------------------------------" -ForegroundColor Magenta

try {
    # Keep the script running and pipe logs from both jobs
    while ($true) {
        $minioLogs = Receive-Job -Job $minioJob -ErrorAction SilentlyContinue
        if ($minioLogs) {
             foreach($line in $minioLogs) { Write-Host "[MINIO] $line" -ForegroundColor Yellow }
        }

        $backendLogs = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendLogs) { 
            foreach($line in $backendLogs) { Write-Host "[BACKEND] $line" -ForegroundColor Cyan }
        }

        $frontendLogs = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendLogs) {
            foreach($line in $frontendLogs) { Write-Host "[FRONTEND] $line" -ForegroundColor Green }
        }
        
        Start-Sleep -Milliseconds 200
    }
}
finally {
    Write-Host "`nStopping services..." -ForegroundColor Red
    Stop-Job $minioJob
    Stop-Job $backendJob
    Stop-Job $frontendJob
    Remove-Job $minioJob
    Remove-Job $backendJob
    Remove-Job $frontendJob
    Write-Host "Cleanup complete." -ForegroundColor Gray
}

$env:PATH += ";$env:APPDATA\Python\Scripts"

Write-Host "--------------------------------------------------" -ForegroundColor Magenta
Write-Host "   Blockchain Certificate Verifier Runner" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Magenta

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

Write-Host "[✓] Backend starting on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "[✓] Frontend starting on http://localhost:3000" -ForegroundColor Green
Write-Host "Streaming logs in this terminal... (Press Ctrl+C to stop services)" -ForegroundColor Gray
Write-Host "--------------------------------------------------" -ForegroundColor Magenta

try {
    # Keep the script running and pipe logs from both jobs
    while ($true) {
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
    Stop-Job $backendJob
    Stop-Job $frontendJob
    Remove-Job $backendJob
    Remove-Job $frontendJob
    Write-Host "Cleanup complete." -ForegroundColor Gray
}

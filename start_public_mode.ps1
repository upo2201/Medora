Set-Location -Path $PSScriptRoot
Write-Host "Starting Medora Public Testing Mode with ngrok..." -ForegroundColor Cyan
$PythonExe = Join-Path $PSScriptRoot "backend\venv\Scripts\python.exe"
if (Test-Path $PythonExe) {
    & $PythonExe (Join-Path $PSScriptRoot "start_public_mode.py")
} else {
    python (Join-Path $PSScriptRoot "start_public_mode.py")
}


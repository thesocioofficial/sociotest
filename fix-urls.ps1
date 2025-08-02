// PowerShell script to replace localhost URLs with environment-aware URLs
// This script will be run to fix remaining hardcoded URLs

$files = @(
    "client\app\profile\page.tsx",
    "client\app\manage\page.tsx", 
    "client\app\fest\[id]\page.tsx",
    "client\app\event\[id]\page.tsx",
    "client\app\edit\fest\[id]\page.tsx",
    "client\app\edit\event\[id]\page.tsx",
    "client\app\create\fest\page.tsx"
)

foreach ($file in $files) {
    $fullPath = "d:\BCA\SOCIO\sociotest\$file"
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file"
        (Get-Content $fullPath) -replace 'http://localhost:8000/api/', '${getApiUrl("/api/' | Set-Content $fullPath
        (Get-Content $fullPath) -replace 'http://localhost:8000', '${config.API_URL}' | Set-Content $fullPath
    }
}

Write-Host "URL replacement completed for all files"

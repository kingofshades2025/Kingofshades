# Sync env vars to shady-boys/kingofshades (serves kingofshadesnj.com)
# Prerequisite: vercel login with the Shady Boys team account, then link:
#   npx vercel link --scope shady-boys --project kingofshades
#
# Usage: .\scripts\sync-shady-boys-env.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root ".env.local"

if (-not (Test-Path $envFile)) {
  Write-Error ".env.local not found at $envFile"
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"')
    Set-Item -Path "env:$name" -Value $value
  }
}

$required = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TO",
  "NEXT_PUBLIC_APP_URL",
  "EMAIL_FUNCTION_SECRET"
)

foreach ($name in $required) {
  if (-not (Get-Item "env:$name" -ErrorAction SilentlyContinue)) {
    Write-Error "Missing $name in .env.local"
  }
}

$targets = @("production", "development", "preview")

Write-Host "Setting env vars on shady-boys/kingofshades..." -ForegroundColor Cyan

foreach ($target in $targets) {
  foreach ($name in $required) {
    $value = (Get-Item "env:$name").Value
    vercel env rm $name $target --yes 2>$null
    if ($target -eq "preview") {
      vercel env add $name $target --value $value --yes --force
    } else {
      vercel env add $name $target --value $value --yes
    }
    Write-Host "  $name ($target)" -ForegroundColor Green
  }
}

Write-Host "`nRedeploying production..." -ForegroundColor Cyan
Push-Location $root
vercel --prod --yes
Pop-Location

Write-Host "`nDone. Test: https://www.kingofshadesnj.com/admin/login" -ForegroundColor Green

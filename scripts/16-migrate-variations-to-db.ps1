# PowerShell script to migrate auto-generated variations to database
# This will help save existing variations to database

Write-Host "🔄 Starting variation migration..." -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please run setup-env.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Read environment variables
$envContent = Get-Content ".env.local" -Raw
$supabaseUrl = ""
$supabaseKey = ""

if ($envContent -match 'NEXT_PUBLIC_SUPABASE_URL=(.+)') {
    $supabaseUrl = $matches[1].Trim()
}

if ($envContent -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)') {
    $supabaseKey = $matches[1].Trim()
}

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Supabase credentials not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found Supabase credentials" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Open Supabase Dashboard" -ForegroundColor White
Write-Host "2. Go to SQL Editor" -ForegroundColor White
Write-Host "3. Copy the contents of scripts/15-save-auto-variations-to-db.sql" -ForegroundColor White
Write-Host "4. Paste and run the SQL script" -ForegroundColor White
Write-Host "5. This will create Size and Add-ons variations for all products" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Supabase URL: $supabaseUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open the SQL script file..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the SQL script file
if (Test-Path "scripts/15-save-auto-variations-to-db.sql") {
    notepad "scripts/15-save-auto-variations-to-db.sql"
} else {
    Write-Host "❌ SQL script file not found!" -ForegroundColor Red
}

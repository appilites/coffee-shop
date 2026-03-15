# Setup Environment Variables Script
# This script helps you set up .env.local file with your Supabase credentials

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment Variables Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "C:\Users\LENOVO\Desktop\mix\coffee shop"
$envFile = "$baseDir\.env.local"

# Supabase Configuration
$supabaseUrl = "https://xnmnklgmmeqpajxwrkir.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczNDQzOCwiZXhwIjoyMDg4MzEwNDM4fQ.swodebMA9Oz_YhxPyYiFsYv7QhTC94QXQScZYhkJ898"

Write-Host "Creating .env.local file..." -ForegroundColor Yellow

$envContent = "# Supabase Configuration for Coffee Shop`n"
$envContent += "# Generated automatically - DO NOT commit this file to git!`n`n"
$envContent += "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl`n"
$envContent += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey`n`n"
$envContent += "# Service Role Key (for admin operations - keep secret!)`n"
$envContent += "# This key bypasses RLS policies - only use in server-side code`n"
$envContent += "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey`n"

try {
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -Force
    Write-Host "SUCCESS: .env.local file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: $envFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANT: This file contains sensitive keys!" -ForegroundColor Yellow
    Write-Host "  - Never commit .env.local to git" -ForegroundColor Yellow
    Write-Host "  - Keep SUPABASE_SERVICE_ROLE_KEY secret" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Setup complete! You can now run 'npm run dev'" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not create .env.local file: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .env.local manually with:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl" -ForegroundColor Cyan
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey" -ForegroundColor Cyan
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey" -ForegroundColor Cyan
}

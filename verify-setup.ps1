# Coffee Shop & Admin Dashboard Setup Verification Script
# Run this script to verify your setup is correct

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Coffee Shop Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "C:\Users\LENOVO\Desktop\mix\coffee shop"
$errors = @()
$warnings = @()

# Check 1: Project Structure
Write-Host "📁 Checking project structure..." -ForegroundColor Yellow

if (Test-Path "$baseDir\package.json") {
    Write-Host "   ✅ Coffee Shop project found" -ForegroundColor Green
} else {
    Write-Host "   ❌ Coffee Shop project not found" -ForegroundColor Red
    $errors += "Coffee Shop project not found"
}

if (Test-Path "$baseDir\admin-dashboard\package.json") {
    Write-Host "   ✅ Admin Dashboard project found" -ForegroundColor Green
} else {
    Write-Host "   ❌ Admin Dashboard project not found" -ForegroundColor Red
    $errors += "Admin Dashboard project not found"
}

Write-Host ""

# Check 2: Environment Files
Write-Host "🔐 Checking environment files..." -ForegroundColor Yellow

if (Test-Path "$baseDir\.env.local") {
    Write-Host "   ✅ Coffee Shop .env.local exists" -ForegroundColor Green
    $envContent = Get-Content "$baseDir\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "   ✅ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Supabase URL not found in .env.local" -ForegroundColor Yellow
        $warnings += "Supabase URL not configured in Coffee Shop"
    }
} else {
    Write-Host "   ⚠️  Coffee Shop .env.local missing" -ForegroundColor Yellow
    $warnings += "Create .env.local in Coffee Shop root directory"
}

if (Test-Path "$baseDir\admin-dashboard\.env.local") {
    Write-Host "   ✅ Admin Dashboard .env.local exists" -ForegroundColor Green
    $envContent = Get-Content "$baseDir\admin-dashboard\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "   ✅ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Supabase URL not found in .env.local" -ForegroundColor Yellow
        $warnings += "Supabase URL not configured in Admin Dashboard"
    }
} else {
    Write-Host "   ⚠️  Admin Dashboard .env.local missing" -ForegroundColor Yellow
    $warnings += "Create .env.local in admin-dashboard directory"
}

Write-Host ""

# Check 3: Supabase Client Files
Write-Host "🔧 Checking Supabase configuration..." -ForegroundColor Yellow

if (Test-Path "$baseDir\lib\supabase\client.ts") {
    Write-Host "   ✅ Coffee Shop Supabase client configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ Coffee Shop Supabase client missing" -ForegroundColor Red
    $errors += "Coffee Shop Supabase client not found"
}

if (Test-Path "$baseDir\admin-dashboard\lib\supabase.ts") {
    Write-Host "   ✅ Admin Dashboard Supabase client configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ Admin Dashboard Supabase client missing" -ForegroundColor Red
    $errors += "Admin Dashboard Supabase client not found"
}

Write-Host ""

# Check 4: Database Scripts
Write-Host "📜 Checking database setup scripts..." -ForegroundColor Yellow

if (Test-Path "$baseDir\scripts\05-complete-setup.sql") {
    Write-Host "   ✅ Complete setup script found" -ForegroundColor Green
    Write-Host "   📝 Run this in Supabase SQL Editor" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Setup script missing" -ForegroundColor Red
    $errors += "Database setup script not found"
}

Write-Host ""

# Check 5: Key Files
Write-Host "📄 Checking key configuration files..." -ForegroundColor Yellow

$keyFiles = @(
    @{Path="$baseDir\lib\supabase\database.ts"; Name="Coffee Shop Database Service"},
    @{Path="$baseDir\admin-dashboard\lib\database.ts"; Name="Admin Dashboard Database Service"},
    @{Path="$baseDir\app\menu\page.tsx"; Name="Coffee Shop Menu Page"},
    @{Path="$baseDir\admin-dashboard\app\api\products\route.ts"; Name="Admin Product API"}
)

foreach ($file in $keyFiles) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $($file.Name) missing" -ForegroundColor Yellow
        $warnings += "$($file.Name) not found"
    }
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Make sure you ran 05-complete-setup.sql in Supabase SQL Editor" -ForegroundColor White
    Write-Host "2. Terminal 1: cd `"C:\Users\LENOVO\Desktop\mix\coffee shop`"; npm run dev" -ForegroundColor White
    Write-Host "3. Terminal 2: cd `"C:\Users\LENOVO\Desktop\mix\coffee shop\admin-dashboard`"; npm run dev" -ForegroundColor White
    Write-Host "4. Open http://localhost:3000 (Coffee Shop)" -ForegroundColor White
    Write-Host "5. Open http://localhost:3001 (Admin Dashboard)" -ForegroundColor White
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ ERRORS FOUND ($($errors.Count)):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   - $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "📖 See SETUP_GUIDE.md for detailed instructions" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "To test database connection, run:" -ForegroundColor Cyan
Write-Host "   node scripts/test-database-connection.js" -ForegroundColor White
Write-Host ""

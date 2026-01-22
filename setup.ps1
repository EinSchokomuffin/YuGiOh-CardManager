#!/usr/bin/env pwsh
# DuelVault PostgreSQL Setup Script

Write-Host "🚀 DuelVault PostgreSQL Setup" -ForegroundColor Cyan

# Check für PostgreSQL Installation
$postgresPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$postgresExists = Test-Path $postgresPath

if (-not $postgresExists) {
    Write-Host "❌ PostgreSQL nicht gefunden unter: $postgresPath" -ForegroundColor Red
    Write-Host "📥 Bitte installiere PostgreSQL 16 von: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "💡 Oder nutze Docker Desktop mit: docker compose up -d" -ForegroundColor Green
    exit 1
}

Write-Host "✅ PostgreSQL gefunden" -ForegroundColor Green

# Datenbank erstellen
Write-Host "`n📦 Erstelle Datenbank 'duelvault_db'..." -ForegroundColor Cyan

$sqlScript = @"
CREATE USER duelvault WITH PASSWORD 'duelvault_password';
CREATE DATABASE duelvault_db OWNER duelvault;
ALTER ROLE duelvault CREATEDB;
"@

# Speichere SQL in temporärer Datei
$tempFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempFile -Value $sqlScript

try {
    # Führe SQL aus (braucht PostgreSQL superuser password)
    & $postgresPath -U postgres -f $tempFile -h localhost
    Write-Host "✅ Datenbank erstellt" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Fehler beim Erstellen der Datenbank" -ForegroundColor Yellow
    Write-Host "Führe manuell aus:" -ForegroundColor Yellow
    Write-Host $sqlScript -ForegroundColor Gray
}

Remove-Item $tempFile -Force

# Backend Setup
Write-Host "`n📝 Richte Backend auf..." -ForegroundColor Cyan
if (Test-Path ".\backend") {
    cd backend
    
    # Prisma Generate
    Write-Host "Generiere Prisma Client..." -ForegroundColor Yellow
    npm run prisma:generate
    
    # Migrations
    Write-Host "Führe Migrations durch..." -ForegroundColor Yellow
    npm run prisma:migrate
    
    cd ..
    Write-Host "✅ Backend konfiguriert" -ForegroundColor Green
} else {
    Write-Host "❌ Backend-Verzeichnis nicht gefunden" -ForegroundColor Red
}

# Frontend Setup
Write-Host "`n📝 Richte Frontend auf..." -ForegroundColor Cyan
if (Test-Path ".\frontend") {
    cd frontend
    
    # Dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installiere Dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    cd ..
    Write-Host "✅ Frontend konfiguriert" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend-Verzeichnis nicht gefunden" -ForegroundColor Red
}

Write-Host "`n✨ Setup abgeschlossen!" -ForegroundColor Green
Write-Host "`n🚀 Starten mit:" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend && npm run start:dev" -ForegroundColor Yellow
Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor Yellow

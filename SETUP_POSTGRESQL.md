# 🚀 PostgreSQL Setup für DuelVault

## Status: PostgreSQL Connection Failed

Die PostgreSQL-Datenbank läuft nicht auf `localhost:5432`. Hier sind deine Optionen:

---

## ✅ Option 1: PostgreSQL lokal installieren (Windows) - EMPFOHLEN

### 1️⃣ PostgreSQL herunterladen & installieren
- **Download**: https://www.postgresql.org/download/windows/
- **Version**: PostgreSQL 16
- **Bei Installation**:
  - Port: `5432` (default)
  - Superuser Password: Merken!
  - Installation Path: Standard (C:\Program Files\PostgreSQL\16)

### 2️⃣ Datenbank erstellen
Öffne **PowerShell als Administrator**:

```powershell
# Verbinde zu PostgreSQL
psql -U postgres -h localhost

# Gib dein Passwort ein

# Kopiere diese Befehle in die psql-Konsole:
CREATE USER duelvault WITH PASSWORD 'test123';
CREATE DATABASE duelvault OWNER duelvault;
ALTER USER duelvault CREATEDB;
\q
```

### 3️⃣ Backend Setup
```powershell
cd backend
$env:DATABASE_URL="postgresql://postgres:test123@localhost:5432/duelvault?schema=public"
npm run prisma:migrate
```

---

## 📦 Option 2: PostgreSQL mit Docker (wenn Docker Desktop installiert ist)

```powershell
# Aus dem Projekt-Verzeichnis:
docker compose up -d

# Warte 10 Sekunden, dann:
$env:DATABASE_URL="postgresql://duelvault:duelvault_password@localhost:5432/duelvault_db?schema=public"
cd backend
npm run prisma:migrate
```

---

## 🧪 Test-Verbindung

```powershell
# Test ob Datenbank läuft:
$env:DATABASE_URL="postgresql://postgres:test123@localhost:5432/duelvault?schema=public"
cd backend
npm run prisma:generate

# Sollte sagen: "✔ Generated Prisma Client"
```

---

## 🛠️ Automatisiert starten (nachdem PostgreSQL läuft)

```powershell
$env:DATABASE_URL="postgresql://postgres:test123@localhost:5432/duelvault?schema=public"

# Backend
cd backend
npm run prisma:migrate
npm run start:dev

# (In neuem Terminal):
cd frontend
npm run dev
```

---

## 📝 .env Datei

`backend/.env` sollte diese Zeile haben:
```
DATABASE_URL=postgresql://postgres:test123@localhost:5432/duelvault?schema=public
```

---

## ⚠️ Fehlerdiagnose

**Error: Can't reach database**
- PostgreSQL läuft nicht: Installieren und starten
- Falscher Port/Host: Überprüfe `localhost:5432`
- Firewall blockiert: Überprüfe Windows Defender

**Error: "role postgres does not exist"**
- Datenbank nicht richtig erstellt
- Wiederhole die Erstellungsschritte

**Error: "invalid password"**
- Passwort stimmt nicht
- In .env überprüfen

---

## 💡 Tipps

### DBeaver zum Verwalten (kostenlos):
```
https://dbeaver.io/download/
```

Host: `localhost`
Port: `5432`
Database: `duelvault`
User: `postgres`
Password: [Dein Passwort]

### pgAdmin (kostenlos, web-based):
```
Installiere über: https://www.pgadmin.org/
Oder mit Docker: docker run -p 5050:80 dpage/pgadmin4
```

---

**Viel Erfolg! 🎉**

Bei Fragen: Schau auf [PostgreSQL Docs](https://www.postgresql.org/docs/)

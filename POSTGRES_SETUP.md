# PostgreSQL Setup für DuelVault

## Option 1: PostgreSQL mit Docker Desktop (empfohlen)

### Installation
1. Installiere [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Starten Sie Docker Desktop

### Datenbank starten
```bash
cd YGO-card-manager
docker compose up -d
```

Das startet:
- **PostgreSQL** auf Port `5432`
- **Adminer** auf `http://localhost:8080` (GUI für Datenbank-Management)

Zugangsdaten:
- Benutzer: `duelvault`
- Passwort: `duelvault_password`
- Datenbank: `duelvault_db`

---

## Option 2: PostgreSQL lokal installieren (Windows)

### Installation
1. Lade [PostgreSQL 16](https://www.postgresql.org/download/windows/) herunter
2. Installiere mit folgenden Einstellungen:
   - Port: `5432`
   - Passwort (superuser): merken Sie sich das
   - Installation Path: Standard (C:\Program Files\PostgreSQL\16)

### Datenbank erstellen
Öffne PowerShell und führe aus:

```powershell
# Mit PostgreSQL CLI
psql -U postgres

# In der psql-Konsole:
CREATE USER duelvault WITH PASSWORD 'duelvault_password';
CREATE DATABASE duelvault_db OWNER duelvault;
ALTER ROLE duelvault CREATEDB;
\q
```

### .env Datei aktualisieren
```env
DATABASE_URL="postgresql://duelvault:duelvault_password@localhost:5432/duelvault_db?schema=public"
```

---

## Option 3: Lokale PostgreSQL mit WSL2 (für Windows)

```bash
# WSL2 Terminal öffnen
wsl

# PostgreSQL installieren
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Service starten
sudo service postgresql start

# Datenbank erstellen
sudo -u postgres psql

# In psql:
CREATE USER duelvault WITH PASSWORD 'duelvault_password';
CREATE DATABASE duelvault_db OWNER duelvault;
ALTER ROLE duelvault CREATEDB;
\q
```

---

## Prisma Migrations ausführen

Nach PostgreSQL-Setup:

```bash
cd backend

# Generiere Prisma Client
npm run prisma:generate

# Führe Migrations durch
npm run prisma:migrate

# (Optional) Seed Daten
npm run prisma:seed
```

---

## Verbindung testen

```bash
cd backend

# Starte den Server
npm run start:dev
```

Du solltest sehen:
```
[Nest] 12:34:56.123 LOG [NestFactory] Starting Nest application...
[Nest] 12:34:56.456 LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 12:34:56.789 LOG [NestApplication] Nest application successfully started
Server running on http://localhost:3001
```

---

## Datenbank visualisieren

### Mit pgAdmin (kostenlos)
```bash
docker run -p 5050:80 \
  -e "PGADMIN_DEFAULT_EMAIL=admin@example.com" \
  -e "PGADMIN_DEFAULT_PASSWORD=admin" \
  dpage/pgadmin4
```

Dann öffne: `http://localhost:5050`

### Mit DBeaver (kostenlos, Desktop App)
1. [DBeaver herunterladen](https://dbeaver.io/download/)
2. Neue PostgreSQL-Verbindung erstellen:
   - Host: `localhost`
   - Port: `5432`
   - Datenbank: `duelvault_db`
   - Benutzer: `duelvault`
   - Passwort: `duelvault_password`

---

## Fehlerbehebung

### "connection refused"
- Stelle sicher, dass PostgreSQL läuft
- Docker: `docker compose ps`
- Lokal: Task Manager → Services Tab → PostgreSQL Status

### "FATAL: role 'duelvault' does not exist"
- Datenbank wurde nicht erstellt
- Wiederholt die Erstellungsschritte

### "migration pending"
```bash
cd backend
npm run prisma:migrate -- --name init
```

---

## Umgebungsvariablen

Bearbeite `backend/.env`:
```env
DATABASE_URL="postgresql://duelvault:duelvault_password@localhost:5432/duelvault_db?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Viel Erfolg! 🚀

# DuelVault Production Deployment

## Quick Start

### 1. Erstelle .env Datei
```bash
cp .env.example .env
nano .env  # Werte anpassen
```

### 2. Generiere sichere Secrets
```bash
# JWT Secret generieren
openssl rand -base64 64

# Starkes DB Passwort generieren
openssl rand -base64 32
```

### 3. Starte die Anwendung
```bash
# Production Build und Start
docker-compose up -d --build

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

### 4. Erste Daten importieren
```bash
# Karten von YGOPRODeck importieren (einmalig)
curl -X POST http://localhost:8081/api/v1/ygoprodeck/sync
```

## Ports

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8081
- **PostgreSQL**: intern (nicht exponiert)

## Umgebungsvariablen

Siehe `.env.example` für alle verfügbaren Optionen.

Wichtigste Variablen:
- `DB_PASSWORD` - Datenbank Passwort
- `JWT_SECRET` - JWT Signing Key (min. 64 Zeichen)
- `CORS_ORIGIN` - Frontend URL für CORS
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Production Deployment

Für echte Production mit SSL/Domain:

### Mit Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/duelvault
server {
    listen 80;
    server_name duelvault.deine-domain.de;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.duelvault.deine-domain.de;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL mit Let's Encrypt:
```bash
sudo certbot --nginx -d duelvault.deine-domain.de -d api.duelvault.deine-domain.de
```

## Nützliche Befehle

```bash
# Container stoppen
docker-compose down

# Container stoppen und Volumes löschen (ACHTUNG: Daten gehen verloren!)
docker-compose down -v

# Logs ansehen
docker-compose logs -f backend
docker-compose logs -f frontend

# In Container shell
docker-compose exec backend sh
docker-compose exec postgres psql -U duelvault -d duelvault_db

# Datenbank Backup
docker-compose exec postgres pg_dump -U duelvault duelvault_db > backup.sql

# Datenbank Restore
docker-compose exec -T postgres psql -U duelvault duelvault_db < backup.sql
```

## Troubleshooting

### Backend startet nicht
```bash
# Logs prüfen
docker-compose logs backend

# Datenbank-Migration manuell ausführen
docker-compose exec backend npx prisma migrate deploy
```

### Frontend zeigt "API nicht erreichbar"
- Prüfe `NEXT_PUBLIC_API_URL` in .env
- Prüfe CORS_ORIGIN im Backend
- Prüfe ob Backend Container läuft: `docker-compose ps`

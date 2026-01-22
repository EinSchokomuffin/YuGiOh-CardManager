# Portainer Environment Variables

## Für Docker Stack Deployment in Portainer

Diese Umgebungsvariablen musst du in Portainer eintragen:

### ✅ Pflicht-Variablen

```env
# Datenbank
DB_PASSWORD=<generiere-mit-openssl-rand-base64-32>

# JWT Authentication
JWT_SECRET=<generiere-mit-openssl-rand-base64-64>

# CORS & URLs
CORS_ORIGIN=https://deine-domain.de
NEXT_PUBLIC_API_URL=https://api.deine-domain.de/api/v1
```

### 🔧 Optionale Variablen (mit Defaults)

```env
# Token Gültigkeit
JWT_EXPIRATION=7d

# Node Umgebung
NODE_ENV=production

# Ports (nur ändern wenn nötig)
FRONTEND_PORT=8080
BACKEND_PORT=8081
```

---

## Portainer Setup - Schritt für Schritt

### 1. Stack erstellen
1. Portainer öffnen → **Stacks** → **Add Stack**
2. Name: `duelvault`
3. Build method: **Repository** oder **Upload** (docker-compose.yml)

### 2. Environment Variables eintragen

Klicke auf **"Add environment variable"** und füge hinzu:

| Name | Value | Beschreibung |
|------|-------|-------------|
| `DB_PASSWORD` | `<generiertes-passwort>` | Datenbank Passwort |
| `JWT_SECRET` | `<generierter-jwt-secret>` | JWT Secret Key (64+ Zeichen) |
| `CORS_ORIGIN` | `https://deine-domain.de` | Frontend URL |
| `NEXT_PUBLIC_API_URL` | `https://api.deine-domain.de/api/v1` | Backend API URL |
| `JWT_EXPIRATION` | `7d` | Optional: Token Gültigkeit |
| `NODE_ENV` | `production` | Optional: Umgebung |

### 3. Secrets generieren (VORHER!)

**Auf deinem Server/Terminal ausführen:**

```bash
# JWT Secret generieren (kopiere Output)
openssl rand -base64 64

# Datenbank Passwort generieren (kopiere Output)
openssl rand -base64 32
```

Diese Werte dann in Portainer eintragen!

### 4. Stack deployen

- Klicke auf **"Deploy the stack"**
- Warte bis alle Container starten
- Prüfe Logs bei Fehlern

---

## Minimal-Konfiguration (Copy & Paste Ready)

**Für Portainer Environment Variables:**

```
DB_PASSWORD=IHR-GENERIERTES-DATENBANK-PASSWORT-HIER
JWT_SECRET=IHR-GENERIERTER-JWT-SECRET-MINDESTENS-64-ZEICHEN-LANG-HIER
CORS_ORIGIN=https://duelvault.ihre-domain.de
NEXT_PUBLIC_API_URL=https://api.duelvault.ihre-domain.de/api/v1
JWT_EXPIRATION=7d
NODE_ENV=production
```

---

## Nach dem Deployment

### Container prüfen
In Portainer unter **Containers** solltest du sehen:
- ✅ `duelvault_postgres` (running)
- ✅ `duelvault_backend` (running)  
- ✅ `duelvault_frontend` (running)

### Erste Karten importieren
Im Container **duelvault_backend** → Console → Befehl:

```bash
curl -X POST http://localhost:3001/api/v1/ygoprodeck/sync
```

Oder extern:
```bash
curl -X POST http://dein-server:8081/api/v1/ygoprodeck/sync
```

### Testen
- Frontend: `http://dein-server:8080`
- Backend Health: `http://dein-server:8081/api/v1/health`

---

## Troubleshooting in Portainer

### Backend startet nicht
1. Container **duelvault_backend** → **Logs** ansehen
2. Häufige Fehler:
   - `JWT_SECRET` zu kurz → Min. 32 Zeichen
   - Datenbank nicht erreichbar → `DB_PASSWORD` falsch?
   - Migration-Fehler → Container neu starten

### Frontend zeigt "API nicht erreichbar"
- `NEXT_PUBLIC_API_URL` prüfen
- Muss von außen erreichbar sein (z.B. `https://api.domain.de/api/v1`)
- NICHT `http://localhost:8081` in Production!

### Alle Container neu starten
Stack → **Stop** → **Start** oder **Redeploy**

---

## Wichtig für Production

⚠️ **Vor Go-Live:**
1. ✅ Sichere Secrets generieren (`openssl rand -base64 64`)
2. ✅ Richtige Domains in `CORS_ORIGIN` und `NEXT_PUBLIC_API_URL`
3. ✅ SSL/HTTPS einrichten (Nginx Reverse Proxy + Let's Encrypt)
4. ✅ Backup-Strategie für PostgreSQL Volume
5. ✅ Karten-Daten importieren

📝 **Nicht vergessen:**
- Ports 8080 (Frontend) und 8081 (Backend) in Firewall freigeben
- Oder Reverse Proxy (Nginx) vorschalten

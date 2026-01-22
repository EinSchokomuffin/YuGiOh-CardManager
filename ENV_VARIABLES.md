# DuelVault - Umgebungsvariablen

## Backend Umgebungsvariablen

### Datenbank
| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL Verbindungs-URL | `postgresql://duelvault:password@localhost:5432/duelvault_db` | ✅ |

### Anwendung
| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `NODE_ENV` | Node Umgebung | `production` oder `development` | ✅ |
| `PORT` | Backend Server Port | `3001` | ✅ |

### Authentifizierung
| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret Key für JWT Signierung (min. 32 Zeichen) | `duelvault-super-secret-jwt-key-2024-yugioh` | ✅ |
| `JWT_EXPIRATION` | JWT Token Gültigkeitsdauer | `7d` (7 Tage), `24h`, `30m` | ❌ (Default: `7d`) |

### CORS & Security
| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `CORS_ORIGIN` | Erlaubte Frontend-URL für CORS | `https://duelvault.de` oder `*` | ✅ |

### Logging
| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `LOG_LEVEL` | Log-Level | `debug`, `info`, `warn`, `error` | ❌ (Default: `debug`) |

---

## Frontend Umgebungsvariablen

| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (muss mit `NEXT_PUBLIC_` beginnen) | `http://localhost:3001/api/v1` oder `https://api.duelvault.de/api/v1` | ✅ |
| `NODE_ENV` | Node Umgebung | `production` oder `development` | ❌ |

---

## Docker Compose Umgebungsvariablen

Für `docker-compose.yml` und `docker-compose.prod.yml`:

| Variable | Beschreibung | Beispiel | Pflicht |
|----------|-------------|----------|---------|
| `DB_PASSWORD` | PostgreSQL Datenbank Passwort | `mein-sicheres-passwort-123` | ✅ |
| `JWT_SECRET` | JWT Secret Key (min. 64 Zeichen für Production) | Generieren mit `openssl rand -base64 64` | ✅ |
| `JWT_EXPIRATION` | JWT Gültigkeit | `7d` | ❌ (Default: `7d`) |
| `CORS_ORIGIN` | Frontend URL | `https://duelvault.de` | ✅ |
| `NEXT_PUBLIC_API_URL` | API URL für Frontend | `https://api.duelvault.de/api/v1` | ✅ |
| `NODE_ENV` | Umgebung | `production` | ❌ (Default: `production`) |
| `FRONTEND_PORT` | Externer Frontend Port | `7843` | ❌ (Default: `7843`) |
| `BACKEND_PORT` | Externer Backend Port | `7844` | ❌ (Default: `7844`) |

---

## Beispiel .env Dateien

### Development (.env.development)
```env
# Backend
DATABASE_URL="postgresql://duelvault:duelvault_password@localhost:5432/duelvault_db"
NODE_ENV="development"
PORT=3001
JWT_SECRET="development-secret-key-not-for-production"
JWT_EXPIRATION="7d"
CORS_ORIGIN="http://localhost:3000"
LOG_LEVEL="debug"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

### Production (.env)
```env
# Database
DB_PASSWORD="IhrSicheresPasswort123!@#"

# JWT
JWT_SECRET="generiert-mit-openssl-rand-base64-64-mindestens-64-zeichen-lang"
JWT_EXPIRATION="7d"

# URLs & CORS
CORS_ORIGIN="https://duelvault.ihre-domain.de"
NEXT_PUBLIC_API_URL="https://api.duelvault.ihre-domain.de/api/v1"

# Optional
NODE_ENV="production"
FRONTEND_PORT=8080
BACKEND_PORT=8081
```

---

## Secrets generieren

### JWT Secret (empfohlen: 64 Zeichen)
```bash
openssl rand -base64 64
```

### Datenbank Passwort (32 Zeichen)
```bash
openssl rand -base64 32
```

### UUID für andere Zwecke
```bash
uuidgen
```

---

## Wichtige Hinweise

⚠️ **Sicherheit:**
- Verwende **NIE** die Beispiel-Secrets in Production
- `JWT_SECRET` sollte mindestens 64 Zeichen lang sein
- Datenbank-Passwörter sollten komplex sein (Buchstaben, Zahlen, Sonderzeichen)
- `.env` Datei **NIEMALS** in Git committen (steht bereits in `.gitignore`)

🔒 **CORS:**
- In Development: `CORS_ORIGIN="*"` oder `http://localhost:3000`
- In Production: Exakte Domain angeben `https://ihre-domain.de`
- **Niemals** `*` in Production verwenden!

📝 **Next.js:**
- Nur Variablen mit `NEXT_PUBLIC_` Prefix sind im Browser verfügbar
- Backend-URLs sollten NICHT `NEXT_PUBLIC_` haben, außer sie werden im Frontend gebraucht

🐳 **Docker:**
- Umgebungsvariablen werden automatisch aus `.env` geladen
- Alternativ: `.env` Datei mit `docker-compose --env-file .env.production up`

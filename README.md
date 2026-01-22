# 🎴 DuelVault - Yu-Gi-Oh! Collection Manager & Deck Architect

Eine All-in-One-Plattform für Yu-Gi-Oh! Spieler und Sammler zur Verwaltung ihrer Kartensammlung, Echtzeit-Marktpreisverfolgung und Deckbau.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Datenbank Setup](#-datenbank-setup)
- [Entwicklung](#-entwicklung)
- [API Dokumentation](#-api-dokumentation)
- [Tests](#-tests)
- [Projektstruktur](#-projektstruktur)

## ✨ Features

### Collection Management
- 📦 Granulare Erfassung (Set-Code, Zustand, Sprache, Edition, Seltenheit)
- 📁 Multi-Portfolio (Sammlung, Tauschordner, Suchliste, Bulk)
- 📊 Fortschritts-Tracker für Set-Vollständigkeit
- 📤 Import/Export (CSV, JSON)

### Valuation & Finance
- 💰 Echtzeit-Preise via YGOPRODeck API
- 📈 Gewinn/Verlust-Analyse
- 🏆 Top Movers Dashboard

### Smart Deck Builder
- ✅ Ownership-Check beim Deckbau
- 🛒 Fehlkarten-Export mit Kostenschätzung
- 🖱️ Drag & Drop Interface

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Sprache**: TypeScript 5
- **ORM**: Prisma 5
- **Datenbank**: PostgreSQL 15+
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **UI Components**: Shadcn/ui

### Externe APIs
- **Kartendaten**: [YGOPRODeck API](https://ygoprodeck.com/api-guide/)
- **Preisdaten**: Cardmarket, TCGPlayer

## 📋 Voraussetzungen

Stelle sicher, dass folgende Software installiert ist:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 oder **pnpm** >= 8.0.0
- **PostgreSQL** >= 15.0
- **Git**

## 🚀 Installation

### 1. Repository klonen

```bash
git clone https://github.com/your-username/duelvault.git
cd duelvault
```

### 2. Backend Setup

```bash
# In das Backend-Verzeichnis wechseln
cd backend

# Dependencies installieren
npm install

# Prisma Client generieren
npm run prisma:generate
```

### 3. Frontend Setup

```bash
# In das Frontend-Verzeichnis wechseln
cd ../frontend

# Dependencies installieren
npm install
```

## ⚙️ Konfiguration

### Backend Environment Variables

Erstelle eine `.env` Datei im `backend/` Verzeichnis:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/duelvault?schema=public"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (für CORS)
FRONTEND_URL=http://localhost:3000

# Optional: API Keys für erweiterte Features
# CARDMARKET_API_KEY=your_key
# TCGPLAYER_API_KEY=your_key
```

### Frontend Environment Variables

Erstelle eine `.env.local` Datei im `frontend/` Verzeichnis:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 🗄️ Datenbank Setup

### 1. PostgreSQL Datenbank erstellen

```sql
-- Via psql oder pgAdmin
CREATE DATABASE duelvault;
```

### 2. Prisma Migrationen ausführen

```bash
cd backend

# Initiale Migration erstellen und ausführen
npm run prisma:migrate

# Optional: Seed-Daten laden
npm run prisma:seed
```

### 3. Kartendaten synchronisieren

Nach dem Start des Backends kannst du alle Yu-Gi-Oh! Karten importieren:

```bash
# Via API Call (Backend muss laufen)
curl -X POST http://localhost:3001/api/v1/ygoprodeck/sync/batch?batchSize=500
```

Oder über die Swagger UI: `http://localhost:3001/api/docs`

## 💻 Entwicklung

### Backend starten

```bash
cd backend

# Development Mode (mit Hot Reload)
npm run start:dev

# Production Mode
npm run build
npm run start:prod
```

Der Backend-Server läuft auf `http://localhost:3001`

### Frontend starten

```bash
cd frontend

# Development Mode
npm run dev

# Production Build
npm run build
npm run start
```

Die Frontend-App läuft auf `http://localhost:3000`

### Beide gleichzeitig starten

Im Root-Verzeichnis:

```bash
# Mit npm workspaces oder concurrently
npm run dev
```

## 📚 API Dokumentation

Nach dem Start des Backends ist die Swagger-Dokumentation verfügbar unter:

**`http://localhost:3001/api/docs`**

### Wichtige Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| `GET` | `/api/v1/health` | Health Check |
| `GET` | `/api/v1/cards` | Kartensuche |
| `GET` | `/api/v1/cards/:id` | Karte nach ID |
| `POST` | `/api/v1/collection/add` | Karte zur Sammlung hinzufügen |
| `GET` | `/api/v1/collection` | Sammlung abrufen |
| `GET` | `/api/v1/collection/stats` | Sammlungsstatistiken |
| `POST` | `/api/v1/decks` | Deck erstellen |
| `POST` | `/api/v1/decks/:id/validate-ownership` | Ownership Check |
| `POST` | `/api/v1/ygoprodeck/sync` | Kartendaten synchronisieren |

## 🧪 Tests

### Backend Tests

```bash
cd backend

# Unit Tests
npm run test

# Unit Tests mit Watch Mode
npm run test:watch

# Test Coverage
npm run test:cov

# E2E Tests
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Unit Tests
npm run test

# E2E Tests mit Playwright
npm run test:e2e
```

## 📁 Projektstruktur

```
duelvault/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Datenbankschema
│   │   ├── migrations/        # DB Migrationen
│   │   └── seed.ts            # Seed-Daten
│   ├── src/
│   │   ├── cards/             # Karten-Modul
│   │   ├── collection/        # Sammlungs-Modul
│   │   ├── decks/             # Deck-Modul
│   │   ├── health/            # Health Check
│   │   ├── prisma/            # Prisma Service
│   │   ├── ygoprodeck/        # YGOPRODeck API Integration
│   │   ├── app.module.ts      # Haupt-Modul
│   │   └── main.ts            # Entry Point
│   ├── test/                  # Tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React Komponenten
│   │   ├── hooks/             # Custom Hooks
│   │   ├── lib/               # Utilities
│   │   └── types/             # TypeScript Types
│   ├── public/                # Statische Assets
│   ├── package.json
│   └── next.config.js
├── instructions.md            # Projekt-Spezifikation
└── README.md
```

## 🔧 Troubleshooting

### PostgreSQL Verbindungsfehler

```bash
# Prüfe ob PostgreSQL läuft
pg_isready

# Unter Windows (Services)
net start postgresql-x64-15
```

### Prisma Client Fehler

```bash
cd backend
npm run prisma:generate
```

### Port bereits belegt

```bash
# Windows: Port 3001 freigeben
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## 📜 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

---

**Made with ❤️ for Yu-Gi-Oh! Duelists and Collectors**

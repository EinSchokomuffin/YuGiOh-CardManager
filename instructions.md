# DuelVault – Yu-Gi-Oh! Collection Manager & Deck Architect
## Product Requirements Document (PRD)

---

## 1. Executive Summary

**DuelVault** ist eine All-in-One-Plattform (Web & PWA), die es Spielern und Sammlern ermöglicht, ihre Yu-Gi-Oh! Kartensammlung zu digitalisieren, deren Marktwert in Echtzeit zu verfolgen und Decks basierend auf dem tatsächlichen Besitz zu bauen. Der Fokus liegt auf der nahtlosen Integration von Datenbank, Sammlung und Marktplatz-Preisen.

---

## 2. Kernfunktionen (Abgeleitet & Priorisiert)

Basierend auf der Analyse der Referenz (cardcluster) sind dies die **Must-Have Features**:

### A. Collection Management (Das Herzstück)

- **Granulare Erfassung**: Speicherung von Karte, Set-Code (z.B. LOB-EN001), Zustand (Near Mint, Played etc.), Sprache, Auflage (1st Edition) und Seltenheit.
- **Multi-Portfolio**: Trennung in "Sammlung", "Tauschordner" (Trades), "Wants" (Suchliste) und "Bulk".
- **Excel-Mode (Massenbearbeitung)**: Ein Tabellen-Interface, um schnell Attribute vieler Karten gleichzeitig zu ändern (z.B. alle markierten Karten auf "Verkauft" setzen).
- **Fortschritts-Tracker**: Visualisierung der Vollständigkeit eines Sets (z.B. "Du hast 80% von Legend of Blue Eyes").

### B. Valuation & Finance

- **Echtzeit-Preise**: Tägliche Synchronisation mit Cardmarket (Europa) und TCGPlayer (USA).
- **Gewinn/Verlust-Analyse**: Eingabefeld für "Einkaufspreis" vs. "Aktueller Marktwert".
- **Dashboard**: Anzeige des Gesamtwerts der Sammlung und der "Top Movers" (Karten mit größtem Preisanstieg).

### C. Smart Deck Builder

- **Ownership-Check**: Beim Bauen eines Decks wird sofort angezeigt: "Du besitzt 2 von 3 benötigten Kopien".
- **Fehlkarten-Export**: Generierung einer Einkaufsliste für fehlende Karten im Deck mit Kostenschätzung.
- **Drag & Drop Interface**: Visueller Deckbau.

### D. Import/Export

- **CSV-Migration**: Import bestehender Sammlungen (Kompatibilität mit Formaten anderer Tools).
- **Backup**: Export der gesamten Datenbank als JSON/CSV.

---

## 3. Application Stack (Tech Stack Empfehlung)

Um hohe Performance mit modernen Features zu kombinieren:

### Frontend
- **Framework**: Next.js (React) – für SEO und schnelles Server-Side Rendering.
- **Styling**: Tailwind CSS – für schnelles UI-Design.
- **State Management**: TanStack Query (für Server State) + Zustand (für Client State).
- **UI Components**: Shadcn/ui (für Tabellen und Modals).

### Backend
- **Runtime**: Node.js (NestJS Framework) – strikte Architektur, gut skalierbar.
- **Sprache**: TypeScript (Fullstack Typsicherheit).

### Datenbank
- **Core DB**: PostgreSQL (Relationale Daten: User → Collection → Card → Price).
- **Search Engine**: Meilisearch oder Elasticsearch (für die schnelle Kartensuche mit Tippfehler-Toleranz).

### Infrastruktur
- **Hosting**: Vercel (Frontend) / AWS oder DigitalOcean (Backend & DB).
- **Image Hosting**: AWS S3 + CloudFront CDN (für die hochauflösenden Kartenscans).

### Datenquellen (Third Party)
- **Base Data**: Yu-Gi-Oh! API by YGOPRODeck (Kartendaten).
- **Pricing**: Cardmarket API / TCGPlayer API (ggf. Scraper Service, falls API-Limitierungen existieren).

---

## 4. API Architektur & Vorgehensweise

Hier werden die wichtigsten Endpoints und die Logik dahinter beschrieben.

### A. Datenbank Schema (Vereinfacht)

```
Users
├── id (UUID)
├── email
└── tier (free/pro)

Cards
├── id (UUID)
├── konami_id
├── name
└── image_url

Printings
├── id (UUID)
├── card_id (FK)
├── set_code
└── rarity

CollectionItems
├── id (UUID)
├── user_id (FK)
├── printing_id (FK)
├── condition
├── language
├── quantity
└── purchase_price

Decks
├── id (UUID)
├── user_id (FK)
└── content (JSON list of card_ids)
```

### B. Wichtige API Calls

#### 1. Karte zur Sammlung hinzufügen

**Endpoint**: `POST /api/v1/collection/add`

**Logik**: Prüft, ob der User das Limit erreicht hat (Freemium). Wenn Eintrag existiert (gleiches Set/Condition), erhöhe `quantity`, sonst erstelle neuen Eintrag.

**Payload**:
```json
{
  "printing_id": "uuid-of-printing",
  "condition": "NM",
  "language": "DE",
  "quantity": 3,
  "storage_location": "Binder A"
}
```

#### 2. Deck Validierung gegen Sammlung (Ownership Check)

**Endpoint**: `POST /api/v1/decks/validate-ownership`

**Logik**: Der Client sendet eine Deckliste. Der Server gleicht diese gegen die `CollectionItems` Tabelle des Users ab.

**Response**:
```json
{
  "deck_id": "123",
  "total_cards": 40,
  "owned_cards": 35,
  "missing_cards": [
    {
      "card_name": "Ash Blossom",
      "needed": 3,
      "owned": 1,
      "est_cost": "15.00 EUR"
    }
  ]
}
```

#### 3. Preis-Update Routine (Cronjob)

**Prozess**: Läuft jede Nacht um 03:00 Uhr.

**Ablauf**:
1. Fetch updated prices from Cardmarket API für alle Printings
2. Update `price_current` in der Datenbank
3. Berechne `portfolio_value` für alle User neu (oder on-demand beim Login)

---

## 5. KI-Integration & System Prompts (KI Instructions)

Wir integrieren KI für zwei Anwendungsfälle: Karten-Scanner (Vision) und Deck-Assistent (LLM).

### Feature A: AI Card Scanner

Der User fotografiert eine Karte, die KI erkennt Karte, Set-Code und Sprache.

**Vorgehensweise**: Client sendet Bild → Backend leitet an OpenAI Vision API (oder lokales OCR Modell) weiter → Antwort wird geparsed.

**System Prompt**:

```
# Role
You are an expert OCR and Image Recognition System specialized in Yu-Gi-Oh! Trading Cards.

# Task
Analyze the provided image of a trading card. Extract the following specific details and return them in strictly valid JSON format.

# Extraction Rules
1. **Card Name**: The text usually found at the very top of the card.
2. **Set Code**: The alphanumeric code usually found on the right side, below the artwork (e.g., "LOB-EN001", "MP19-DE005"). This is the MOST important field.
3. **Language**: Infer from the card text (DE, EN, FR, etc.).

# JSON Output Format
{
  "card_name": "string",
  "set_code": "string",
  "language_code": "ISO-2-DIGIT",
  "confidence_score": float (0-1)
}

# Constraints
- If the Set Code is unreadable, set it to null.
- Do not include markdown code blocks (```json), just the raw JSON.
```

### Feature B: Smart Deck Coach

Der User fragt: "Ich habe 3x Blue-Eyes White Dragon. Welches Deck kann ich bauen?"

**Vorgehensweise**: RAG (Retrieval Augmented Generation). Wir füttern das LLM mit der JSON-Liste der Sammlung des Users und fragen nach Synergien.

**System Prompt**:

```
# Role
You are a professional Yu-Gi-Oh! Deck Building Coach. You know the current meta and casual strategies.

# Context
The user has provided a JSON list of cards they currently own (their "Collection").
The user wants to build a deck around a specific archetype or card: "{{USER_QUERY}}".

# Goal
Suggest a deck list that prioritizes cards the user ALREADY owns to minimize cost.

# Instructions
1. Analyze the user's collection provided in the context.
2. Create a deck list (Main Deck, Extra Deck).
3. Clearly mark cards the user needs to buy with "[MISSING]".
4. Explain the basic strategy of the deck.

# Tone
Encouraging, strategic, and analytical.
```

---

## 6. Nächste Schritte zur Umsetzung

1. **Daten-Aggregierung**: Setup der Datenbank mit allen existierenden ~12.000+ Yu-Gi-Oh! Karten (Nutzung der YGOPRODeck API zum Seeding).
2. **Prototyping**: Bau des "Add Card" Flows im Frontend.
3. **Pricing-Bot**: Schreiben des Python/Node Scripts, das Preisdaten scraped oder per API zieht.
4. **Code-Implementierung**: Datenbankschema (Prisma/PostgreSQL) oder React-Component für die Kartensuche.

---

## Referenzen

- **YGOPRODeck API**: https://ygoprodeckapi.com/
- **Cardmarket API**: https://www.cardmarket.com/en/Api/
- **TCGPlayer API**: https://docs.tcgplayer.com/

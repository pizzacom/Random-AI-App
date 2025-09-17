# Zeit Tracking App

Eine einfache und benutzerfreundliche Zeiterfassungs-Web-App für persönliche oder kleine Teams.

🌐 **Live Demo**: [https://pizzacom.github.io/Random-AI-App/](https://pizzacom.github.io/Random-AI-App/)

## Features

- **⏱️ Timer-System**: Start/Stop-Funktionalität mit automatischer Zeitberechnung
- **📅 Kalender-Interface**: Manuelle Zeiteingabe und Bearbeitung von Einträgen
- **📊 Berichte**: Monatliche Zeitberichte mit Pausenberechnungen, exportierbar als PDF
- **⚙️ Einstellungen**: Benutzerinformationen und Standard-Pausenzeit konfigurierbar
- **🌍 Mehrsprachig**: Deutsch und Englisch unterstützt
- **💾 Offline-Funktionalität**: Lokale Speicherung aller Daten im Browser
- **📱 Mobile-First Design**: Responsive Design für alle Geräte
- **🚀 Progressive Web App**: Installierbar auf allen Geräten, arbeitet offline

## PWA Features

- **📱 Installierbar**: Kann wie eine native App installiert werden
- **⚡ Offline-fähig**: Funktioniert auch ohne Internetverbindung
- **🔔 App-Shortcuts**: Schnellzugriff auf Timer und Kalender
- **🎨 Native Darstellung**: Vollbild-Modus ohne Browser-UI
- **💾 Automatisches Caching**: Schnelle Ladezeiten nach Installation

## Technologien

- **React 18** - Moderne UI-Framework
- **date-fns** - Datum-Utilities
- **jsPDF** - PDF-Generierung
- **LocalStorage** - Datenpersistierung
- **CSS3** - Responsive Styling
- **Service Worker** - PWA und Offline-Funktionalität

## Installation & Start

### Für Entwicklung

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm start
   ```

3. **App öffnen:**
   Die App öffnet sich automatisch unter [http://localhost:3000](http://localhost:3000)

### Als Web App installieren

#### Desktop (Chrome/Edge):
1. Öffne die App im Browser
2. Klicke auf das ⬇️ Symbol in der Adressleiste oder
3. Browser-Menü → "App installieren"

#### Mobile (Android):
1. Öffne die App im Chrome Browser
2. Tippe auf "Zur Startseite hinzufügen" wenn der Banner erscheint
3. Oder: Browser-Menü → "App installieren"

#### Mobile (iOS):
1. Öffne die App in Safari
2. Tippe auf das Teilen-Symbol 📤
3. Wähle "Zum Home-Bildschirm"

#### Aus der App heraus:
- Ein Installationsbanner erscheint automatisch
- Klicke auf "Installieren" für direkten Download

### Build für Produktion

```bash
npm run build
```

Erstellt eine optimierte Build-Version im `build/` Ordner mit PWA-Unterstützung.

## Verwendung

### Timer verwenden
1. Gehe zum **Timer**-Tab
2. Gib optional eine Beschreibung ein
3. Klicke auf **"Starten"** um die Zeiterfassung zu beginnen
4. Klicke auf **"Stoppen"** um die Session zu beenden
5. Der Eintrag wird automatisch gespeichert

### Manuelle Zeiteinträge
1. Gehe zum **Kalender**-Tab
2. Wähle ein Datum aus
3. Klicke auf **"Neuer Eintrag"**
4. Gib Start-/Endzeit und optional Pause und Beschreibung ein
5. Speichere den Eintrag

### PDF-Berichte erstellen
1. Gehe zum **Berichte**-Tab
2. Wähle den gewünschten Monat
3. Optional: Gib Benutzerinformationen ein
4. Klicke auf **"PDF Export"**

## Projektstruktur

```
src/
├── components/
│   ├── Timer/          # Timer-Komponente
│   ├── Calendar/       # Kalender und Zeiteinträge
│   ├── TimeEntry/      # Einzelne Zeiteintrag-Anzeige
│   └── Reports/        # PDF-Export und Berichte
├── hooks/
│   ├── useTimer.js     # Timer-Logik
│   ├── useTimeEntries.js # CRUD-Operationen für Einträge
│   └── useLocalStorage.js # LocalStorage-Persistierung
├── utils/
│   ├── timeCalculations.js # Zeit-Berechnungen
│   └── pdfGenerator.js     # PDF-Generierung
└── App.js              # Haupt-App-Komponente
```

## Datenstruktur

```javascript
{
  id: string,           // UUID
  date: string,         // ISO-Datum (YYYY-MM-DD)
  startTime: string,    // HH:MM Format
  endTime: string,      // HH:MM Format
  breakDuration: number, // Pause in Minuten
  description: string,  // Optionale Beschreibung
  duration: number      // Berechnete Gesamtdauer in Minuten
}
```

## Build für Produktion

```bash
npm run build
```

Erstellt eine optimierte Build-Version im `build/` Ordner.

## Browser-Kompatibilität

- Chrome/Edge (empfohlen)
- Firefox
- Safari
- Mobile Browser

## Datenschutz

Alle Daten werden **lokal im Browser** gespeichert. Es werden keine Daten an externe Server gesendet.

## Lizenz

MIT License - siehe LICENSE Datei für Details.

---

**Hinweis**: Diese App ist für die lokale Nutzung konzipiert. Für Team-Nutzung sollten die Daten regelmäßig exportiert und gesichert werden.
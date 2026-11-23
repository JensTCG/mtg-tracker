# Podboard – Anleitung

Diese Anleitung erklärt, wie Podboard funktioniert, wie du es für dich einrichtest und wie du es im Alltag benutzt.

---

## Was steckt dahinter?

Podboard besteht aus drei Teilen:

| Teil | Was es ist | Wo es liegt |
|---|---|---|
| **App** | Die Eingabe-Oberfläche fürs Handy | https://jenstcg.github.io/podboard/ – für alle gleich |
| **Tabelle** | Deine eigene Google-Tabelle mit allen Spielen und Auswertungen | In **deinem** Google Drive |
| **Script** | Ein kleines Programm, das an deiner Tabelle hängt | In **deiner** Tabelle (Google Apps Script) |

So läuft ein Spiel durch:

1. Du trägst es in der **App** ein. Es wird sofort auf dem Handy gespeichert.
2. Die App schickt es an **dein Script**, zusammen mit deinem geheimen Schlüssel.
3. Das Script prüft den Schlüssel und hängt das Spiel als neue Zeile an **deine Tabelle** an.
4. Die Blätter **„Analysen“** und **„Statistik“** rechnen automatisch neu.

Die App selbst speichert nichts auf einem fremden Server. Sie weiß nur, wo dein Script liegt, und das nur auf deinem Handy.

---

## Einrichten (einmalig, ca. 10 Minuten)

Du brauchst: ein Google-Konto, einen Computer für die Einrichtung und ein Android-Handy mit Chrome.

### 1. Vorlage kopieren
1. Öffne den **Vorlagen-Link**. Er endet auf `/copy` und ist auf Anfrage beim Betreiber dieses Projekts erhältlich.
2. Klicke auf **„Kopie erstellen“**. Google weist darauf hin, dass ein Apps Script mitkopiert wird. Das ist richtig so.
3. Die Kopie gehört jetzt **dir** und liegt in deinem Google Drive. Benenne sie, wie du magst.

### 2. Eigene Decks eintragen
Im Blatt **„Meine Decks“** trägst du pro Deck eine Zeile ein:

| Deck-ID | Format | Deckname | Farbidentität | Bracket | Aktiv seit |
|---|---|---|---|---|---|
| D001 | Commander | Krenko, Mob Boss | R | 3 | 01.01.2027 |
| D002 | Pauper | Mono Red | R | | 01.01.2027 |

- **Format** ist genau „Commander“ oder „Pauper“.
- Bei Commander ist der Deckname der Name deines Commanders.
- In der App erscheinen die Decks alphabetisch. Neue Decks siehst du nach *Einstellungen → Decks & Commander neu laden*.

### 3. Script als Web-App bereitstellen
1. In deiner Tabelle oben auf **Erweiterungen → Apps Script** klicken. Ein neuer Tab öffnet sich.
2. Oben rechts auf **Bereitstellen → Neue Bereitstellung** klicken.
3. Links neben „Typ auswählen“ auf das **Zahnrad** klicken und **Web-App** wählen.
4. Einstellen:
   - *Ausführen als:* **Ich**
   - *Zugriff:* **Jeder**
5. Auf **Bereitstellen** klicken, dann auf **Zugriff autorisieren**, und dein Google-Konto wählen.
6. ⚠️ Google zeigt jetzt **„Google hat diese App nicht überprüft“**. Das ist normal: Das Script ist deine eigene Kopie und läuft nur in deinem Konto.
   Klicke auf **„Erweitert“**, dann auf **„Zu Podboard wechseln (unsicher)“** und zum Schluss auf **„Zulassen“**.
7. Es erscheint die **Web-App-URL**, sie endet auf `/exec`. Klicke auf **Kopieren**.

> **Was darf das Script?** Nur diese eine Tabelle bearbeiten, Kartendaten bei Scryfall abrufen und einmal pro Woche die Commander-Liste ergänzen. Auf andere Dateien, Mails oder Kontakte hat es keinen Zugriff.

### 4. Verbindung herstellen
1. Zurück zum Tab mit deiner Tabelle und die Seite **neu laden**.
2. Oben im Menü erscheint **„Podboard“**, das kann ein paar Sekunden dauern. Dort auf **Einrichten / Verbindung anzeigen** klicken.
3. Beim ersten Mal die **Web-App-URL einfügen** und auf **Speichern** klicken.
4. Jetzt siehst du einen **QR-Code**. Dein persönlicher Schlüssel wurde dabei automatisch erzeugt. Ab jetzt ergänzt sich auch die Commander-Liste jeden Montag von selbst.

### 5. Handy verbinden und installieren
1. Den QR-Code mit der **Kamera-App** deines Handys scannen und den Link öffnen.
2. In der App auf **Verbinden** tippen und warten, bis „Verbunden ✓“ erscheint. Das kann bis zu einer Minute dauern.
3. In Chrome oben rechts auf **⋮** tippen, dann **Zum Startbildschirm hinzufügen** und **Installieren** wählen.

Fertig. Ab jetzt öffnest du Podboard über das Symbol auf dem Startbildschirm.

---

## Benutzen

### Ein Spiel eintragen
1. **Format:** Commander oder Pauper.
2. **Mein Deck:** dein Deck antippen.
3. **Wann & wo:** Datum (heute ist vorausgefüllt) und Ort. Zuletzt genutzte Orte werden vorgeschlagen. Bei Pauper zusätzlich Casual oder Turnier und die Runde.
4. **Gegner:**
   - *Commander:* Spieleranzahl wählen und pro Gegner 2–3 Buchstaben des Commanders tippen (z. B. „Kr“ für Krenko …), dann antippen. Die Farben werden übernommen.
   - *Pauper:* den Deck-Namen tippen. Früher genutzte Namen werden vorgeschlagen, online zusätzlich Karten von Scryfall. Die Farben tippst du selbst an.
5. **Ergebnis:**
   - *Commander:* Startspieler, Gewinner, deine Platzierung, deine Mulligans und die Dauer.
   - *Pauper:* pro Spiel, wer angefangen und wer gewonnen hat (Best-of-3), dazu Mulligans und Dauer.
6. **Notizen:** eintragen, wenn du willst, dann auf **Speichern** tippen.

Mit **„Neu“** oben rechts verwirfst du eine angefangene Eingabe. Schließt du die App mitten in der Eingabe, bleibt der Stand erhalten.

### Ohne Internet
Gespeicherte Spiele bleiben auf dem Handy, bis die Tabelle sie bestätigt hat. Ein **gelber Balken** zeigt, wie viele Spiele warten. Die App sendet automatisch, sobald wieder Internet da ist. Mit **„Jetzt synchronisieren“** kannst du nachhelfen. Ein Spiel wird dabei nie doppelt eingetragen.

### Auswertung
- **„Analysen“:** Gesamtbilanz, Siegquoten, Startspieler, Mulligans, je Deck und je Gegner.
- **„Statistik“:** Siegquote gegen Gegnerfarben, Pauper Turnier gegen Casual, je Deck mit und ohne Startspieler. Oben in **B2** ein Jahr eintragen (z. B. 2027) oder leer lassen für alle Jahre.

### Updates
Die App aktualisiert sich beim Öffnen selbst, neu installieren musst du nie. Nach einem Update zeigt sie einmal, was neu ist.

---

## Anpassen

Die Tabelle gehört dir, du kannst sie frei erweitern:
- **Frei änderbar:** „Analysen“ und „Statistik“ umbauen, eigene Blätter, Formeln und Diagramme anlegen, Farben und Formatierung ändern.
- **Bitte so lassen**, sonst findet die App ihre Daten nicht mehr:
  - die Blattnamen **„Spiele Commander“**, **„Spiele Pauper“**, **„Meine Decks“** und **„CommanderDB“**,
  - die **Spaltenüberschriften** in diesen vier Blättern. Neue Spalten ganz rechts anhängen ist okay.
- Tipp: Vor größeren Umbauten über *Datei → Kopie erstellen* eine Sicherung anlegen. Über *Datei → Versionsverlauf* kommst du an ältere Stände zurück.

Falsch eingetragene Spiele korrigierst oder löschst du direkt in der Tabelle.

---

## Sicherheit

- **Schlüssel geheim halten.** Wer Script-Adresse *und* Schlüssel kennt, kann Spiele in deine Tabelle eintragen. Den QR-Code also nicht herumzeigen.
- Jede kopierte Tabelle bekommt automatisch einen **eigenen** Schlüssel.
- Daten gehen nur an **Google** (deine Tabelle) und an **Scryfall** (Kartendaten).

---

## Wenn etwas hakt

| Problem | Lösung |
|---|---|
| Menü „Podboard“ fehlt | Tabelle neu laden und ein paar Sekunden warten. |
| Kein QR-Code im Einrichten-Fenster | Fenster schließen und nochmal öffnen. Hilft das nicht, Adresse und Schlüssel von Hand in die App kopieren. |
| „Keine Antwort von Google (Zeitlimit)“ | Google antwortet ab und zu verzögert. Die App versucht es automatisch erneut, dein Spiel geht nicht verloren. |
| „Diese Script-Adresse liefert keine Daten“ | Die falsche Adresse wurde eingefügt. Im Einrichten-Fenster auf **„Script-Adresse ändern“** klicken und die Web-App-URL (endet auf `/exec`) neu einfügen. |
| „Falscher Schlüssel“ | QR-Code neu scannen. |
| Neues Handy | In der Tabelle *Podboard → Einrichten* öffnen und den QR-Code scannen. |
| Andere Tabelle verbinden | In der App unter ⚙︎ → **Verbindung zurücksetzen**. Das geht erst, wenn alle Spiele gesendet sind. |
| Ich habe das Script geändert | In Apps Script unter *Bereitstellen → Bereitstellungen verwalten* die Bereitstellung bearbeiten und bei *Version* „Neue Version“ wählen. Die Adresse bleibt dabei gleich. |

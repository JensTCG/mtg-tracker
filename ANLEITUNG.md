# Podboard – Anleitung

Diese Anleitung erklärt, wie Podboard funktioniert, wie du es für dich einrichtest und wie du es im Alltag benutzt.

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
4. Die Auswertungen (**„Dashboard“**, **„Statistik Commander“**, **„Statistik Pauper“**) rechnen automatisch neu.

Die App selbst speichert nichts auf einem fremden Server. Sie weiß nur, wo dein Script liegt. Das steht nur auf deinem Handy.

## Einrichten (einmalig, ca. 10 Minuten)

Du brauchst: ein Google-Konto, einen Computer für die Einrichtung und ein Smartphone (Android oder iPhone).

### 1. Vorlage kopieren
1. Öffne den **[Vorlagen-Link](https://docs.google.com/spreadsheets/d/1dQ6jEafkvwyQY86VSG_QquwGIeghG_Ygh-FYP8b-ubA/copy)**. Du musst dafür in deinem Google-Konto angemeldet sein.
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
5. Auf **Bereitstellen** klicken, dann auf **Zugriff autorisieren** und dein Google-Konto wählen.
6. **Achtung:** Google zeigt jetzt **„Google hat diese App nicht überprüft“**. Das ist normal: Das Script ist deine eigene Kopie und läuft nur in deinem Konto.
   Klicke auf **„Erweitert“**, dann auf **„Zu Podboard wechseln (unsicher)“**.
7. **Wichtig:** Google fragt jetzt „Select what Podboard can access“ (auf Deutsch: „Auswählen, worauf Podboard zugreifen darf“) und zeigt vier Punkte mit leeren Kästchen. Setze ganz oben das Häkchen bei **„Select all“ / „Alle auswählen“**, damit alle vier Kästchen angehakt sind. Klicke dann unten auf **„Continue“ / „Weiter“**. Fehlt ein Häkchen, funktioniert Podboard nicht.
8. Es erscheint die **Web-App-URL** (endet auf `/exec`). Die brauchst du nicht zu kopieren. Klicke auf **Fertig**.

> **Was darf das Script?** Nur diese eine Tabelle bearbeiten, Kartendaten bei Scryfall abrufen und einmal pro Woche die Commander-Liste ergänzen. Auf andere Dateien, Mails oder Kontakte hat es keinen Zugriff.

### 4. Verbindung herstellen
1. Zurück zum Tab mit deiner Tabelle und die Seite **neu laden**.
2. Oben im Menü erscheint **„Podboard“**, das kann ein paar Sekunden dauern. Dort auf **Einrichten / Verbindung anzeigen** klicken.
3. Es erscheint das Fenster **„Podboard – Verbindung“** mit einem **QR-Code**. Dein persönlicher Schlüssel wurde dabei automatisch erzeugt. Ab jetzt ergänzt sich auch die Commander-Liste jeden Montag von selbst.
4. Siehst du stattdessen ein Feld „Füge hier die Web-App-URL ein“: In Apps Script unter *Bereitstellen → Bereitstellungen verwalten* die Web-App-URL kopieren, dort einfügen und auf **Speichern** klicken.

### 5. Handy verbinden und installieren
1. Den QR-Code mit der **Kamera-App** deines Handys scannen und den Link öffnen.
2. In der App auf **Verbinden** tippen und warten, bis „Verbunden ✓“ erscheint. Das kann bis zu einer Minute dauern.
3. Die App auf den Startbildschirm legen:
   - *Android (Chrome):* oben rechts auf **⋮** tippen, dann **Zum Startbildschirm hinzufügen** und **Installieren** wählen.
   - *iPhone (Safari):* unten auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben) tippen, dann **Zum Home-Bildschirm** und **Hinzufügen** wählen. Den QR-Code dafür mit der Kamera scannen und den Link in Safari öffnen.

Fertig. Ab jetzt öffnest du Podboard über das Symbol auf dem Startbildschirm.

## Benutzen

### Ein Spiel eintragen
1. **Format:** Commander oder Pauper.
2. **Mit welchem Deck?** Dein Deck antippen. Ab 10 Decks gibt es oben eine Suchzeile.
3. **Wann & wo:** Datum (heute ist vorausgefüllt) und Ort. Zuletzt genutzte Orte werden vorgeschlagen. Bei Pauper zusätzlich Casual oder Turnier und die Runde.
4. **Gegner:**
   - *Commander:* Spieleranzahl wählen und pro Gegner 2–3 Buchstaben des Commanders tippen (z. B. „Kr“ für Krenko …), dann antippen. Die Farben werden übernommen.
   - *Pauper:* den Deck-Namen tippen. Früher genutzte Namen werden vorgeschlagen, online zusätzlich Karten von Scryfall.
5. **Ergebnis:**
   - *Commander:* Startspieler, Gewinner, deine Platzierung, deine Mulligans und die Dauer.
   - *Pauper:* pro Spiel, wer angefangen und wer gewonnen hat (Best-of-3), dazu Mulligans und Dauer. Steht es am Ende unentschieden (z. B. 1:1), speichert die App „Draw“ als Gewinner.
6. **Notizen:** eintragen, wenn du willst, dann auf **Speichern** tippen.

Mit **„Neu“** oben rechts verwirfst du eine angefangene Eingabe. Wechselst du kurz in eine andere App, bleibt der Stand erhalten. Schließt du Podboard ganz, startet die App beim nächsten Öffnen wieder leer bei der Formatauswahl.

### Ohne Internet
Gespeicherte Spiele bleiben auf dem Handy, bis die Tabelle sie bestätigt hat. Ein **gelber Balken** zeigt, wie viele Spiele warten. Die App sendet automatisch, sobald wieder Internet da ist. Mit **„Jetzt synchronisieren“** kannst du nachhelfen. Ein Spiel wird dabei nie doppelt eingetragen.

### Auswertung
- **„Dashboard“** (erstes Blatt): das Wichtigste auf einen Blick, links Commander, rechts Pauper. Oben bei **„Jahr“** wählst du ein Jahr oder „Alle“. Das gilt auch für die Blätter „Statistik Commander“ und „Statistik Pauper“.
- Knöpfe im Dashboard:
  - **„Am Rechner eintragen“** springt in „Spiele Commander“ bzw. „Spiele Pauper“, direkt in die erste freie Zeile.
  - **„Mit der App eintragen“** öffnet Podboard gleich im richtigen Format. Gedacht für unterwegs aus der Google-Tabellen-App.
  - **„Mehr zu …“** öffnet das Blatt „Statistik Commander“ bzw. „Statistik Pauper“.
- **„Statistik Commander“** und **„Statistik Pauper“:** alle Zahlen im Detail: Übersicht, je Deck, je Gegner, Gegnerfarben (Commander) und Turnier/Casual (Pauper). Zurück geht es unten über den Blatt-Reiter „Dashboard“.
- **Draws bei Pauper:** Ein Match zählt als Unentschieden, wenn bei „Gewinner“ „Draw“ steht oder das Feld leer ist. Draws stehen extra in der Übersicht und im Dashboard. Bei „Letzte 5“ steht dafür ein **D**.
- **Top 5 der Gegner:** Oben rechts neben „Mindestanzahl …“ stellst du ein, wie oft du gegen einen Gegner gespielt haben musst, damit er in der Top 5 auftaucht.
- Diese drei Blätter finden die Spalten über ihre Überschrift. Gelöschte Spalten führen dort also nicht zu Fehlern, die passende Zahl bleibt nur leer.

### Updates
Die App aktualisiert sich beim Öffnen selbst, neu installieren musst du nie. Nach einem Update zeigt sie einmal, was neu ist.

## Anpassen

Die Tabelle gehört dir, du kannst sie frei erweitern:
- **Frei änderbar:** „Dashboard“, „Statistik Commander“ und „Statistik Pauper“ umbauen, eigene Blätter, Formeln und Diagramme anlegen, Farben und Formatierung ändern. Listen, die nach unten wachsen (z. B. alle Gegner), brauchen darunter freien Platz. Schreibst du dort etwas hinein, zeigt die Liste #REF! statt Zahlen.
- **Bitte so lassen**, sonst findet die App ihre Daten nicht mehr:
  - die Blattnamen **„Spiele Commander“**, **„Spiele Pauper“**, **„Meine Decks“** und **„CommanderDB“**,
  - die **Spaltenüberschriften** in diesen vier Blättern. Neue Spalten ganz rechts anhängen ist okay.
- **Spalten löschen** geht in „Spiele Commander“ und „Spiele Pauper“ auch. Nur **„Spiel-ID“** und **„Datum“** müssen bleiben. Was die App für eine gelöschte Spalte erfasst, wird dann nicht gespeichert. Auswertungen, die diese Spalte brauchen, zeigen danach nichts mehr an.
- Tipp: Vor größeren Umbauten über *Datei → Kopie erstellen* eine Sicherung anlegen. Über *Datei → Versionsverlauf* kommst du an ältere Stände zurück.

Falsch eingetragene Spiele korrigierst oder löschst du direkt in der Tabelle. Trägst du ein Spiel von Hand ein, bekommt die neue Zeile ihre Spiel-ID automatisch, sobald du etwas hineinschreibst (z. B. das Datum).

### Neue Auswertungen aus der Vorlage übernehmen
Die Vorlage wird ab und zu verbessert, zum Beispiel durch ein neues Diagramm oder ein überarbeitetes Blatt „Statistik Pauper“. Du kannst einzelne Blätter in deine Tabelle holen, **ohne dass deine Spiele verloren gehen**. Deine Daten stehen nur in „Spiele Commander“, „Spiele Pauper“ und „Meine Decks“. Diese Blätter tauschst du nie aus.

**Woran du ein Update erkennst**
- Podboard zeigt nach einem Update kurz „Neu in Version …“. Steht dort etwas zur Vorlage, lohnt sich ein Blick.
- Oben rechts im **„Dashboard“** (Zelle E1) steht, welche Vorlagen-Version du hast, z. B. „Vorlage 1.0“. Unten unter *Versionen der Vorlage* siehst du, welche Version die neueste ist.

**So holst du dir ein neues Blatt**
1. Den Vorlagen-Link öffnen, aber am Ende **`/copy` durch `/edit` ersetzen**. So siehst du die Vorlage nur an und legst keine neue Kopie an.
2. Unten auf dem gewünschten Blatt-Reiter (z. B. „Statistik Pauper“) einen **Rechtsklick** machen und **Kopieren nach → Vorhandene Tabelle** wählen. Dann deine eigene Tabelle aussuchen und auf **Auswählen** klicken.
3. In deiner Tabelle erscheint jetzt „Kopie von Statistik Pauper“. Dein **altes** Blatt „Statistik Pauper“ löschen (Rechtsklick → *Löschen*) und die Kopie mit Rechtsklick → *Umbenennen* in **„Statistik Pauper“** umbenennen.
4. Fertig: Die Formeln greifen über die Blattnamen auf deine Spiele zu und rechnen sofort mit deinen Daten.

Bei „Dashboard“, „Statistik Commander“ und „Statistik Pauper“ holst du am besten alle drei zusammen. Die Knöpfe im Dashboard springen in einer neuen Kopie der ganzen Vorlage sicher an die richtige Stelle. Holst du die Blätter einzeln in eine ältere Tabelle, kann es sein, dass die Sprung-Knöpfe nicht mehr treffen. Die Zahlen stimmen trotzdem.

**Achtung:** Hast du ein Blatt selbst angepasst, ersetzt das neue Blatt deine Änderungen. Benenne dein altes Blatt in dem Fall lieber um (z. B. „Statistik Pauper alt“), statt es zu löschen. Übertrag deine Anpassungen danach.

**Was sich von selbst aktualisiert:** die App (bei jedem Öffnen) und die Commander-Liste (jeden Montag).
**Was du selbst holst:** neue oder verbesserte Auswertungsblätter, so wie oben beschrieben.
**Script-Änderungen** kommen nicht automatisch in deine Kopie. Das ist selten. Falls es einmal nötig ist, steht es unter *Versionen der Vorlage*.

### Script aktualisieren
Nur nötig, wenn unter *Versionen der Vorlage* steht, dass es ein neues Script gibt.
1. Auf GitHub die Datei [script/Code.js](https://github.com/JensTCG/podboard/blob/main/script/Code.js) öffnen. Oben rechts über dem Code auf das Symbol **„Copy raw file“** (zwei Blätter) klicken.
2. In deiner Tabelle auf **Erweiterungen → Apps Script** klicken. Links **Code.gs** anklicken. Im Code-Fenster alles markieren (Strg+A, am Mac Cmd+A), einfügen (Strg+V, am Mac Cmd+V) und mit dem **Disketten-Symbol** speichern.
3. Oben rechts auf **Bereitstellen → Bereitstellungen verwalten** klicken. Beim Stift-Symbol (Bearbeiten) unter *Version* **„Neue Version“** wählen und auf **Bereitstellen** klicken.

Deine Script-Adresse bleibt dabei gleich. Am Handy musst du nichts neu einrichten.

### Versionen der Vorlage
| Version | Datum | Was ist neu |
|---|---|---|
| 1.0 | 23.11.2026 | Erste Version: Dashboard mit Knöpfen und Jahr-Auswahl, Statistik Commander (mit Gegnerfarben), Statistik Pauper (mit Draws, Turnier/Casual), automatische Spiel-ID beim Eintragen von Hand, CommanderDB mit wöchentlicher Ergänzung |

## Sicherheit

- **Schlüssel geheim halten.** Wer Script-Adresse *und* Schlüssel kennt, kann Spiele in deine Tabelle eintragen. Den QR-Code also nicht herumzeigen.
- Jede kopierte Tabelle bekommt automatisch einen **eigenen** Schlüssel.
- Daten gehen nur an **Google** (deine Tabelle) und an **Scryfall** (Kartendaten).

## Wenn etwas hakt

| Problem | Lösung |
|---|---|
| Menü „Podboard“ fehlt | Tabelle neu laden und ein paar Sekunden warten. |
| Kein QR-Code im Einrichten-Fenster | Fenster schließen und nochmal öffnen. Hilft das nicht, Adresse und Schlüssel von Hand in die App kopieren. |
| „Keine Antwort von Google (Zeitlimit)“ | Google antwortet ab und zu verzögert. Die App versucht es automatisch erneut, dein Spiel geht nicht verloren. |
| „Diese Script-Adresse liefert keine Daten“ | Die falsche Adresse wurde eingefügt. Im Einrichten-Fenster auf **„Script-Adresse ändern“** klicken und die Web-App-URL (endet auf `/exec`) neu einfügen. |
| „Falscher Schlüssel“ | QR-Code neu scannen. |
| Neues Handy | In der Tabelle *Podboard → Einrichten* öffnen und den QR-Code scannen. |
| Andere Tabelle verbinden | In der App auf das **Zahnrad** oben rechts tippen, dann **Verbindung zurücksetzen**. Das geht erst, wenn alle Spiele gesendet sind. |
| Ich habe das Script geändert | In Apps Script unter *Bereitstellen → Bereitstellungen verwalten* die Bereitstellung bearbeiten und bei *Version* „Neue Version“ wählen. Die Adresse bleibt dabei gleich. |

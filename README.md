# Podboard

**Magic-Partien am Handy erfassen – Commander und Pauper – direkt in die eigene Google-Tabelle.**

Ein privates Hobbyprojekt: kostenlos, ohne App Stores, ohne Werbung, ohne Konto bei einem fremden Dienst.
Jede Person nutzt die App mit **ihrer eigenen** Google-Tabelle – niemand sieht die Spiele der anderen.

---

## Selbst nutzen

Du brauchst: ein Google-Konto, einen Computer für die Einrichtung und ein Smartphone (Android oder iPhone). Dauer: ca. 10 Minuten.
Halte dich an diese Reihenfolge, denn die App funktioniert erst, wenn deine Tabelle fertig ist.

1. **Vorlage kopieren:** [Hier klicken und „Kopie erstellen“ wählen](https://docs.google.com/spreadsheets/d/1dQ6jEafkvwyQY86VSG_QquwGIeghG_Ygh-FYP8b-ubA/copy). Die Tabelle liegt dann in deinem eigenen Google Drive und gehört nur dir.
2. **Tabelle einrichten:** Decks eintragen, das Script freigeben und den QR-Code erzeugen. Wie das geht, steht Schritt für Schritt in der [Anleitung](ANLEITUNG.md#einrichten-einmalig-ca-10-minuten).
3. **Handy verbinden:** den QR-Code mit dem Handy scannen. Er öffnet die App unter https://jenstcg.github.io/podboard/ und verbindet sie mit deiner Tabelle.

Du musst niemanden fragen und dir nichts zuschicken lassen. Alles, was du brauchst, ist hier verlinkt.

---

## So sieht der Ablauf aus

1. **Format** wählen – Commander oder Pauper
2. **Eigenes Deck** antippen
3. **Datum & Ort** – heute ist vorausgefüllt, zuletzt genutzte Orte werden vorgeschlagen
4. **Gegner** – bei Commander 2 Buchstaben tippen (z. B. „Kr“ → Krenko …), Farben werden automatisch übernommen
5. **Ergebnis** – Startspieler, Gewinner, Platzierung, Mulligans, Dauer; bei Pauper Best-of-3 (z. B. 2:1)
6. **Notizen** – Speichern, fertig

## Was die App kann

| | |
|---|---|
| **Offline** | Spiele werden auf dem Handy gespeichert und automatisch gesendet, sobald wieder Internet da ist. |
| **Kein Doppeleintrag** | Jedes Spiel hat eine eigene Kennung – auch mehrfaches Senden erzeugt nur eine Zeile. |
| **Commander-Liste** | Alle Commander (von [Scryfall](https://scryfall.com)) – ergänzt sich jeden Montag automatisch mit neuen Sets. |
| **Farben** | Farbidentität der Gegner wird mitgespeichert, für Auswertungen „gegen Blau“, „gegen Dreifarbig“ … |
| **Auswertung** | Passiert in der Google-Tabelle per Formeln – frei anpassbar. |
| **Wie eine App** | Auf den Startbildschirm legen – mit eigenem Symbol, ohne Browserleiste. |

## Sicherheit & Datenschutz

- In diesem Repository stehen **keine** Spiele, Tabellen-Adressen oder Schlüssel – nur der Programmcode.
- Die Verbindung zur eigenen Tabelle (Script-Adresse + geheimer Schlüssel) wird nur **auf dem eigenen Handy** gespeichert.
- Ohne den Schlüssel kann niemand etwas in eine Tabelle eintragen oder daraus lesen.
- Öffentlich heißt hier nur: Man kann den Code **lesen und kopieren**. Ändern kann ihn nur der Besitzer.
- Daten gehen nur an **Google** (in die eigene Tabelle) und an **Scryfall** (Kartensuche bei Pauper, wöchentliche Commander-Liste) – sonst nirgendwohin.

## Wie die App entstanden ist

Idee, Anforderungen und Tests stammen von mir – programmiert habe ich Podboard **mit KI-Unterstützung** (Claude von Anthropic).
Jeder Schritt wurde einzeln getestet. Der komplette Code liegt hier offen zum Nachlesen.

## Technik (für Neugierige)

| Ordner | Inhalt |
|---|---|
| [`docs/`](docs) | Die App – reines HTML, CSS und JavaScript, ausgeliefert über GitHub Pages |
| [`script/`](script) | Google Apps Script an der Tabelle: liefert Decks & Commander, hängt Spiele an, prüft den Schlüssel |

---

<sub>Magic: The Gathering ist eine Marke von Wizards of the Coast. Dieses Projekt ist inoffiziell und steht in keiner Verbindung zu Wizards of the Coast. Kartendaten von Scryfall.</sub>

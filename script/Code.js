// Podboard – Backend an der Google-Tabelle.
// Spiele kommen als {Spaltenüberschrift: Wert}; so ist die Spaltenreihenfolge egal und neue Spalten rechts funktionieren sofort.
// Gelöschte Spalten sind erlaubt: Werte ohne passende Spalte werden einfach nicht gespeichert.

const FORMATE = { Commander: 'Spiele Commander', Pauper: 'Spiele Pauper' };
const PFLICHT_SPALTEN = ['Spiel-ID', 'Datum'];
const GEMERKTE_SYNC_IDS = 200; // reicht für Wiederholungen nach Zeitlimit; ~8 KB, Google erlaubt 9 KB je Wert

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Podboard')
    .addItem('Einrichten / Verbindung anzeigen', 'einrichten')
    .addItem('Commander-Liste jetzt aktualisieren', 'commanderJetzt')
    .addToUi();
}

// ---------- CommanderDB automatisch ergänzen ----------
// Holt alle Commander von Scryfall und hängt nur neue (unbekannte Oracle-ID) unten an; bestehende Zeilen bleiben unberührt.
function commanderAktualisieren() {
  const blatt = SpreadsheetApp.getActive().getSheetByName('CommanderDB');
  const kopf = blatt.getRange(1, 1, 1, blatt.getLastColumn()).getValues()[0].map(String);
  const n = blatt.getLastRow();
  const bekannt = new Set(n > 1 ? blatt.getRange(2, kopf.indexOf('Oracle-ID') + 1, n - 1).getValues().flat() : []);
  const jetzt = Utilities.formatDate(new Date(), 'Europe/Berlin', 'dd.MM.yyyy HH:mm');
  const neu = [];
  let url = 'https://api.scryfall.com/cards/search?q=' + encodeURIComponent('is:commander game:paper');
  while (url) {
    const r = UrlFetchApp.fetch(url, { headers: { Accept: 'application/json' }, muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw new Error('Scryfall antwortet nicht (Code ' + r.getResponseCode() + ')');
    const seite = JSON.parse(r.getContentText());
    seite.data.forEach(k => {
      if (bekannt.has(k.oracle_id)) return;
      bekannt.add(k.oracle_id);
      const bild = (k.image_uris || (k.card_faces && k.card_faces[0].image_uris) || {}).normal || '';
      const werte = {
        'Name': k.name, 'Oracle-ID': k.oracle_id, 'Scryfall-ID': k.id,
        'Color Identity': k.color_identity.slice().sort().join(''), // wie bisher: alphabetisch, farblos = leer
        'Type Line': k.type_line, 'Mana Value': k.cmc, 'Image URL': bild, 'Scryfall URL': k.scryfall_uri,
        'zuletzt aktualisiert': jetzt,
      };
      neu.push(kopf.map(h => sicher_(werte[h])));
    });
    url = seite.has_more ? seite.next_page : null;
    Utilities.sleep(150); // Scryfall bittet um höchstens 10 Anfragen pro Sekunde
  }
  if (neu.length) blatt.getRange(n + 1, 1, neu.length, kopf.length).setValues(neu);
  return neu.length;
}

function woechentlichEinrichten_() {
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'commanderAktualisieren')) {
    ScriptApp.newTrigger('commanderAktualisieren').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(5).create();
  }
}

function commanderJetzt() {
  woechentlichEinrichten_();
  const anzahl = commanderAktualisieren();
  SpreadsheetApp.getUi().alert(anzahl + ' neue Commander hinzugefügt.\n\nAb jetzt ergänzt sich die Liste jeden Montag früh automatisch.');
}

// Kopiersicher: Schlüssel und Adresse gelten nur für die Tabelle, in der sie entstanden sind.
// Wer die Vorlage kopiert, bekommt dadurch automatisch einen eigenen Schlüssel.
function eigenschaften_() {
  const p = PropertiesService.getScriptProperties();
  const id = SpreadsheetApp.getActive().getId();
  const fuer = p.getProperty('FUER');
  if (fuer !== id) {
    // Kopie (fremde Markierung) oder ganz neu: frischer Schlüssel. Ohne Markierung, aber mit Schlüssel = Tabelle von vor diesem Update: behalten.
    if (fuer || !p.getProperty('KEY')) {
      p.deleteProperty('URL');
      p.setProperty('KEY', Utilities.getUuid().replace(/-/g, ''));
    }
    p.setProperty('FUER', id);
  }
  return p;
}

function schluessel_() {
  return eigenschaften_().getProperty('KEY');
}

const URL_MUSTER = /^https:\/\/script\.google\.com\/(a\/[^/]+\/)?macros\/s\/[\w-]+\/exec$/;

// Aus dem Einrichten-Fenster aufgerufen (google.script.run), wenn die Web-App-Adresse eingefügt wird.
function speichereUrl(url) {
  url = String(url || '').trim();
  if (!URL_MUSTER.test(url)) throw new Error('Die Adresse muss mit https://script.google.com/macros/s/ beginnen und auf /exec enden.');
  eigenschaften_().setProperty('URL', url);
}

const APP_URL = 'https://jenstcg.github.io/podboard/';

function einrichten() {
  woechentlichEinrichten_(); // auch in jeder Kopie: Commander-Liste hält sich selbst aktuell
  const p = eigenschaften_();
  const d = JSON.stringify({ url: p.getProperty('URL') || '', key: p.getProperty('KEY'), app: APP_URL }).replace(/</g, '\\u003c');
  const box = 'style="width:100%;font:13px monospace;box-sizing:border-box"';
  // Der QR-Code öffnet die App mit Adresse + Schlüssel im #-Teil; der wird nie an einen Server geschickt.
  // Adresse unkodiert + Fehlerkorrektur L: sonst ist der Text zu lang für qrcodejs (bricht ohne Anzeige ab).
  const html = '<div style="font:14px sans-serif">' +
    '<div id="mit" hidden><p><b>Mit dem Handy scannen</b> (Kamera-App):</p><div id="qr" style="display:flex;justify-content:center"></div>' +
    '<p><b>Oder von Hand:</b> App öffnen (' + APP_URL + ') und diese beiden Werte einfügen.</p>' +
    '<p>Script-Adresse</p><textarea id="u" readonly rows="3" ' + box + ' onclick="this.select()"></textarea>' +
    '<p>Schlüssel (geheim halten)</p><textarea id="k" readonly rows="2" ' + box + ' onclick="this.select()"></textarea>' +
    '<p><a href="#" id="aendern">Script-Adresse ändern</a></p></div>' +
    '<div id="ohne" hidden><p><b>Füge hier die Web-App-URL ein.</b> Du findest sie in <i>Erweiterungen → Apps Script → Bereitstellen → Bereitstellungen verwalten</i> (endet auf /exec).</p>' +
    '<input id="neu" ' + box + ' placeholder="https://script.google.com/macros/s/…/exec"><p><button id="speichern">Speichern</button></p><p id="fehler" style="color:#c00"></p></div>' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script><script>' +
    'const D=' + d + ';const $=i=>document.getElementById(i);' +
    'function zeige(){$("mit").hidden=!D.url;$("ohne").hidden=!!D.url;if(!D.url)return;$("qr").innerHTML="";' +
    'new QRCode($("qr"),{text:D.app+"#url="+D.url+"&key="+D.key,width:260,height:260,correctLevel:QRCode.CorrectLevel.L});$("u").value=D.url;$("k").value=D.key;}' +
    '$("speichern").onclick=()=>{const v=$("neu").value.trim();$("fehler").textContent="Speichere …";' +
    'google.script.run.withSuccessHandler(()=>{D.url=v;$("fehler").textContent="";zeige();}).withFailureHandler(e=>{$("fehler").textContent=e.message;}).speichereUrl(v);};' +
    '$("aendern").onclick=e=>{e.preventDefault();$("neu").value=D.url;D.url="";zeige();};zeige();</script></div>';
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(480).setHeight(660), 'Podboard – Verbindung');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function objekte_(blattName) {
  const [kopf, ...zeilen] = SpreadsheetApp.getActive().getSheetByName(blattName).getDataRange().getDisplayValues();
  return zeilen.map(z => Object.fromEntries(kopf.map((k, i) => [k, z[i]])));
}

// Verhindert, dass Text wie "=..." als Formel in der Tabelle landet.
function sicher_(v) {
  if (v === undefined || v === null) return '';
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== schluessel_()) return json_({ ok: false, error: 'Falscher Schlüssel' });
  // Nur hier (als laufende Web-App) kennt Google die richtige /exec-Adresse; im Tabellen-Menü liefert es eine falsche.
  const eigeneUrl = ScriptApp.getService().getUrl();
  if (/\/exec$/.test(eigeneUrl || '')) eigenschaften_().setProperty('URL', eigeneUrl);
  const einzig = a => [...new Set(a.map(String).map(s => s.trim()).filter(Boolean))];
  // shortcut: "zuletzt genutzt" = Zeilenreihenfolge rückwärts, nicht nach Datum sortiert; reicht, solange Spiele chronologisch angehängt werden.
  const spiele = Object.values(FORMATE).flatMap(objekte_).reverse();
  return json_({
    ok: true,
    decks: objekte_('Meine Decks').filter(d => d['Deck-ID']),
    commander: objekte_('CommanderDB').filter(c => c.Name).map(c => [c.Name, c['Color Identity']]),
    orte: einzig(spiele.map(s => s.Ort)),
    pauperGegner: einzig(objekte_(FORMATE.Pauper).reverse().map(s => s.Gegner)),
  });
}

function doPost(e) {
  let daten;
  try { daten = JSON.parse(e.postData.contents); } catch (_) { return json_({ ok: false, error: 'Ungültige Daten' }); }
  if (!daten || daten.key !== schluessel_()) return json_({ ok: false, error: 'Falscher Schlüssel' });

  const blatt = FORMATE[daten.format] && SpreadsheetApp.getActive().getSheetByName(FORMATE[daten.format]);
  if (!blatt) return json_({ ok: false, error: 'Unbekanntes Format: ' + daten.format });
  const spiel = daten.spiel || {};
  if (!spiel['Sync-ID']) return json_({ ok: false, error: 'Sync-ID fehlt' });
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(spiel.Datum || '');
  if (!d) return json_({ ok: false, error: 'Datum fehlt (JJJJ-MM-TT)' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // zwei gleichzeitige Syncs dürfen nicht dieselbe Spiel-ID bekommen
  try {
    const kopf = blatt.getRange(1, 1, 1, blatt.getLastColumn()).getValues()[0].map(String);
    const fehlt = PFLICHT_SPALTEN.filter(k => !kopf.includes(k));
    if (fehlt.length) return json_({ ok: false, error: 'Spalten fehlen in der Tabelle: ' + fehlt.join(', ') });

    const n = blatt.getLastRow();
    const spalte = k => n > 1 && kopf.includes(k) ? blatt.getRange(2, kopf.indexOf(k) + 1, n - 1).getValues().flat() : [];
    const ids = spalte('Spiel-ID');
    // Doppelschutz ohne Spalte: die letzten Sync-IDs merkt sich das Script selbst. Die Spalte zählt zusätzlich, falls es sie gibt.
    const p = eigenschaften_();
    const gemerkt = JSON.parse(p.getProperty('SYNC_IDS') || '[]');
    const schonDa = spalte('Sync-ID').indexOf(spiel['Sync-ID']);
    if (schonDa >= 0 || gemerkt.includes(spiel['Sync-ID'])) return json_({ ok: true, doppelt: true, id: schonDa >= 0 ? ids[schonDa] : '' });

    const id = Math.max(0, ...ids.map(Number).filter(isFinite)) + 1;
    const erfasst = new Date(spiel['Erfasst am'] || Date.now());
    const werte = Object.assign({}, spiel, {
      'Spiel-ID': id,
      'Datum': new Date(+d[1], +d[2] - 1, +d[3]),
      'Erfasst am': isNaN(erfasst) ? new Date() : erfasst,
    });
    const zeile = kopf.map(k => sicher_(werte[k]));
    blatt.getRange(n + 1, 1, 1, zeile.length).setValues([zeile]);
    blatt.getRange(n + 1, kopf.indexOf('Datum') + 1).setNumberFormat('d.m.yyyy');
    if (kopf.includes('Erfasst am')) blatt.getRange(n + 1, kopf.indexOf('Erfasst am') + 1).setNumberFormat('dd.mm.yyyy hh:mm');
    p.setProperty('SYNC_IDS', JSON.stringify(gemerkt.concat(spiel['Sync-ID']).slice(-GEMERKTE_SYNC_IDS)));
    return json_({ ok: true, doppelt: false, id: id });
  } finally {
    lock.releaseLock();
  }
}

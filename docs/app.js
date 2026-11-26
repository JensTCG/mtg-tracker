'use strict';
// Podboard – App. Enthält absichtlich keine Tabellen-ID, Script-Adresse oder Schlüssel:
// beides wird im Einrichtungsbildschirm eingegeben und nur auf diesem Gerät gespeichert.

// Versionen: 1.0.1 = kleine Korrektur, 1.1 = neue Funktion. Bei jeder neuen Version VERSION erhöhen,
// in NEUIGKEITEN kurz (für Laien) eintragen, was neu ist. Danach CACHE in sw.js hochzählen.
const VERSION = '1.0';
const NEUIGKEITEN = {};
const $ = q => document.querySelector(q);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const URL_MUSTER = /^https:\/\/script\.google\.com\/(a\/[^/]+\/)?macros\/s\/[\w-]+\/exec$/;
const lese = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

let cfg = lese('cfg');          // { url, key }
let daten = lese('daten');      // Antwort von doGet: decks, commander, orte, pauperGegner
let spiel = lese('entwurf');    // aktuelles, noch nicht gespeichertes Spiel
let schritt = lese('schritt') || 0;
let ansicht = cfg && daten ? 'spiel' : 'setup';
let meldung = '';
let farbe = new Map();

// Link aus dem QR-Code: …/#url=…&key=… füllt die Einrichtung vor.
const vorschlag = { url: cfg?.url || '', key: '' };
function ausLink() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (!hash.has('url')) return false;
  vorschlag.url = hash.get('url'); vorschlag.key = hash.get('key') || '';
  history.replaceState(null, '', location.pathname); // Schlüssel nicht in der Adresszeile stehen lassen
  ansicht = 'setup'; meldung = 'Werte aus dem QR-Code übernommen – tippe auf „Verbinden“.';
  return true;
}
ausLink();
addEventListener('hashchange', () => { if (ausLink() || formatAusLink()) render(); }); // falls die App schon offen war

// Link vom Dashboard der Tabelle: …/#format=Commander springt gleich zur Deckwahl. Ein angefangenes Spiel bleibt erhalten.
function formatAusLink() {
  const f = new URLSearchParams(location.hash.slice(1)).get('format');
  if (!['Commander', 'Pauper'].includes(f)) return false;
  history.replaceState(null, '', location.pathname);
  if (!cfg || !daten || ansicht !== 'spiel' || (spiel && schritt > 0)) return false;
  if (!spiel) neuesSpiel();
  spiel.format = f;
  if (f === 'Commander') spiel.art = 'Casual';
  gegnerAnpassen(); schritt = 1;
  return true;
}

// ---------- Verbindung zum Script ----------
// Google liefert die Antwort ab und zu nicht aus (hängt ohne Daten): kurzes Zeitlimit, dann neu versuchen.
// Bei POST ungefährlich, weil die Sync-ID doppelte Einträge verhindert.
async function holeJson(url, opt = {}) {
  let r;
  for (let versuch = 1; !r; versuch++) {
    try {
      r = await fetch(url, { ...opt, signal: AbortSignal.timeout(15000) });
    } catch (e) {
      if (e.name !== 'TimeoutError') throw new Error('Keine Verbindung');
      if (versuch === 4) throw new Error('Keine Antwort von Google (Zeitlimit)');
    }
  }
  // Falsche Script-Adresse (z. B. alte Bereitstellung) liefert eine Google-Fehlerseite statt Daten.
  try { return await r.json(); } catch { throw new Error('Diese Script-Adresse liefert keine Daten – bitte Adresse prüfen'); }
}

async function laden(c = cfg) {
  const d = await holeJson(c.url + '?key=' + encodeURIComponent(c.key));
  if (!d.ok) throw new Error(d.error);
  daten = d;
  localStorage.setItem('daten', JSON.stringify(d));
  listen();
}

async function senden(format, zeile) {
  const d = await holeJson(cfg.url, { method: 'POST', body: JSON.stringify({ key: cfg.key, format, spiel: zeile }) });
  if (!d.ok) throw new Error(d.error);
  return d;
}

function listen() {
  // CommanderDB schreibt alphabetisch ("GW") und farblos leer; Blatt „Color Identity“ nutzt WUBRG-Reihenfolge und "C".
  farbe = new Map(daten.commander.map(([name, ci]) => [name, ordne(ci) || 'C']));
}
const ordne = s => [...'WUBRGC'].filter(x => s.includes(x)).join('');

// ---------- Spiel-Entwurf ----------
const heute = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const leererGegner = () => ({ deck: '', farben: '' });
// Ein angefangenes Spiel kann tagelang liegen: Hat der Nutzer das Datum nicht selbst gewählt, gilt immer heute.
function datumAktualisieren() {
  if (!spiel || spiel.datumGewaehlt || spiel.datum === heute()) return false;
  spiel.datum = heute(); merken(); return true;
}

function neuesSpiel() {
  spiel = {
    format: '', deck: '', datum: heute(), ort: daten?.orte[0] || '', art: 'Casual', runde: '',
    anzahl: '4', gegner: [], start: '', gewinner: '', platz: '', dauer: '', mull: '0', notizen: '',
    spiele: [{ start: '', sieg: '' }, { start: '', sieg: '' }, { start: '', sieg: '' }],
    syncId: crypto.randomUUID(), erfasst: new Date().toISOString(),
  };
  schritt = 0;
  gegnerAnpassen();
}

function gegnerAnpassen() {
  const n = spiel.format === 'Pauper' ? 1 : +spiel.anzahl - 1;
  spiel.gegner = Array.from({ length: n }, (_, i) => spiel.gegner[i] || leererGegner());
}

const hol = pfad => pfad.split('.').reduce((o, k) => o?.[k], spiel);
function setze(pfad, wert) {
  const k = pfad.split('.'), letzt = k.pop();
  k.reduce((o, x) => o[x], spiel)[letzt] = wert;
}

// Bo3: nur die Spiele, die im Match zählen (bis jemand 2 Siege hat).
function pauperSpiele() {
  const r = []; let ich = 0, geg = 0;
  for (const g of spiel.spiele) {
    if (ich === 2 || geg === 2) break;
    r.push(g);
    if (!g.sieg) break;
    g.sieg === 'Ich' ? ich++ : geg++;
  }
  return { r, ich, geg };
}

// Spiel → Zeile für die Tabelle, Schlüssel = Spaltenüberschriften.
function zeile(s = spiel) {
  const num = v => v === '' ? '' : Number(v);
  const gemeinsam = {
    Datum: s.datum, Ort: s.ort.trim(), 'Mein Deck': s.deck, Dauer: num(s.dauer), Mulligans: num(s.mull),
    Notizen: s.notizen.trim(),
    'Turnier/Casual': s.art, Runde: s.art === 'Turnier' ? num(s.runde) : '',
    'Erfasst am': s.erfasst, 'Sync-ID': s.syncId,
  };
  if (s.format === 'Commander') {
    const gegner = Object.fromEntries([0, 1, 2, 3, 4].map(i => ['Gegner ' + (i + 1), s.gegner[i]?.deck.trim() || '']));
    return { ...gemeinsam, Spieleranzahl: num(s.anzahl), ...gegner, 'Gegner-Farben': s.gegner.map(g => g.farben).join(', '), Startspieler: s.start, Platzierung: num(s.platz), Gewinner: s.gewinner };
  }
  const { r, ich, geg } = pauperSpiele(), gesp = r.filter(x => x.sieg), gd = s.gegner[0].deck.trim();
  const deckVon = wer => wer === 'Ich' ? s.deck : wer === 'Gegner' ? gd : '';
  return {
    ...gemeinsam, Gegner: gd, Startspieler: deckVon(gesp[0]?.start), 'Anzahl Spiele': gesp.length,
    Gewinner: ich > geg ? s.deck : ich < geg ? gd : 'Draw', Ergebnis: ich + ':' + geg, // „Draw“ ausdrücklich: so erkennt die Tabelle es auch ohne Spalte „Ergebnis“
    'Startspieler je Spiel': gesp.map(x => x.start || '?').join(', '),
  };
}

// ---------- Bausteine ----------
const wahl = (pfad, wert, text = wert) =>
  `<button class="wahl${hol(pfad) === wert ? ' an' : ''}" data-pfad="${pfad}" data-wert="${esc(wert)}">${esc(text)}</button>`;
const feld = (pfad, label, attr = '') =>
  `<label>${label}<input data-pfad="${pfad}" value="${esc(hol(pfad))}" ${attr}></label>`;
const zahl = 'type="number" inputmode="numeric" min="0"';
// Quadrate: bis 2 Stück zwei pro Reihe, ab 3 Stück drei pro Reihe; ab 10 Stück kompakt mit Suchzeile.
function kacheln(pfad, werte) {
  const viele = werte.length > 9;
  const art = werte.length <= 2 ? 'gross' : viele ? 'kompakt' : 'mittel';
  return (viele ? '<input type="search" data-filter placeholder="Suchen, z. B. 2 Buchstaben" autocomplete="off" aria-label="Deck suchen">' : '')
    + `<div class="kacheln ${art}">${werte.map(w => wahl(pfad, w).replace(/>([^<]*)<\/button>$/, '><span>$1</span></button>')).join('')}</div>`;
}

function gegnerHtml() {
  const cmd = spiel.format === 'Commander';
  return (cmd ? `<p class="klein">Spieler am Tisch (mit dir)</p><div class="raster">${['2', '3', '4', '5', '6'].map(n => wahl('anzahl', n)).join('')}</div>` : '')
    + spiel.gegner.map((g, i) => `<fieldset><legend>Gegner${cmd ? ' ' + (i + 1) : ''}</legend>
      ${feld(`gegner.${i}.deck`, cmd ? 'Commander' : 'Deck / Archetyp', `data-vorschlag="${cmd ? 'commander' : 'pauper'}" autocomplete="off" autocapitalize="words"`)}
      ${cmd ? `<div class="farben">${[...'WUBRGC'].map(f => `<button class="farbe f${f}${g.farben.includes(f) ? ' an' : ''}" data-farbe="${i}${f}" aria-label="Farbe ${f}" aria-pressed="${g.farben.includes(f)}">${f}</button>`).join('')}</div>` : ''}
    </fieldset>`).join('');
}

function commanderHtml() {
  const tisch = [spiel.deck, ...spiel.gegner.map(g => g.deck.trim())].filter(Boolean);
  return `<h3>Wer hat angefangen?</h3><div class="liste">${tisch.map(t => wahl('start', t)).join('')}</div>
    <h3>Gewinner</h3><div class="liste">${tisch.map(t => wahl('gewinner', t)).join('')}</div>
    <h3>Meine Platzierung</h3><div class="raster">${Array.from({ length: +spiel.anzahl }, (_, i) => wahl('platz', String(i + 1))).join('')}</div>
    <h3>Meine Mulligans</h3><div class="raster">${['0', '1', '2', '3', '4'].map(m => wahl('mull', m)).join('')}</div>
    ${feld('dauer', 'Dauer (Minuten)', zahl)}`;
}

function pauperHtml() {
  const { r, ich, geg } = pauperSpiele();
  return r.map((_, i) => `<fieldset><legend>Spiel ${i + 1}</legend>
      <p class="klein">Angefangen</p><div class="raster">${wahl(`spiele.${i}.start`, 'Ich')}${wahl(`spiele.${i}.start`, 'Gegner')}</div>
      <p class="klein">Gewonnen</p><div class="raster">${wahl(`spiele.${i}.sieg`, 'Ich')}${wahl(`spiele.${i}.sieg`, 'Gegner')}</div>
    </fieldset>`).join('')
    + `<p class="ergebnis">Ergebnis ${ich}:${geg}</p>
    <h3>Meine Mulligans (gesamt)</h3><div class="raster">${['0', '1', '2', '3', '4'].map(m => wahl('mull', m)).join('')}</div>
    ${feld('dauer', 'Dauer (Minuten)', zahl)}`;
}

const SCHRITTE = [
  { titel: 'Format', html: () => kacheln('format', ['Commander', 'Pauper']),
    fehlt: () => !spiel.format && 'Bitte Format wählen.' },
  { titel: 'Mit welchem Deck?', html: () => {
      const d = daten.decks.filter(x => x.Format === spiel.format).sort((a, b) => a.Deckname.localeCompare(b.Deckname, 'de'));
      return d.length ? kacheln('deck', d.map(x => x.Deckname))
        : `<p>Keine ${esc(spiel.format)}-Decks in „Meine Decks“. Trag sie dort ein und lade die Daten in den Einstellungen neu.</p>`;
    }, fehlt: () => !spiel.deck && 'Bitte Deck wählen.' },
  { titel: 'Wann & wo', html: () => feld('datum', 'Datum', 'type="date"') + feld('ort', 'Ort / Store', 'data-vorschlag="orte" autocomplete="off"')
      + (spiel.format === 'Pauper' ? `<p class="klein">Art</p><div class="raster">${wahl('art', 'Casual')}${wahl('art', 'Turnier')}</div>` : '')
      + (spiel.art === 'Turnier' ? feld('runde', 'Runde', zahl) : ''),
    fehlt: () => !spiel.datum && 'Bitte Datum eingeben.' },
  { titel: 'Gegner', html: gegnerHtml,
    fehlt: () => spiel.gegner.some(g => !g.deck.trim()) && 'Bitte bei jedem Gegner das Deck eintragen.' },
  { titel: 'Ergebnis', html: () => spiel.format === 'Pauper' ? pauperHtml() : commanderHtml(),
    fehlt: () => spiel.format === 'Pauper'
      ? (!pauperSpiele().r[0].sieg && 'Bitte mindestens Spiel 1 eintragen.')
      : (!spiel.gewinner && 'Bitte Gewinner wählen.') || (!spiel.platz && 'Bitte Platzierung wählen.') },
  { titel: 'Notizen', html: () => `<label>Notizen<textarea data-pfad="notizen" rows="5">${esc(spiel.notizen)}</textarea></label>`,
    fehlt: () => '' },
];

// ---------- Anzeige ----------
function merken() {
  localStorage.setItem('entwurf', JSON.stringify(spiel));
  localStorage.setItem('schritt', JSON.stringify(schritt));
}

function render() {
  if (spiel) merken();
  const main = $('#inhalt'), knoepfe = $('#knoepfe');
  $('#meldung').textContent = meldung;

  if (ansicht === 'setup') {
    $('#titel').textContent = 'Einrichten';
    main.innerHTML = `<h2>Mit deiner Tabelle verbinden</h2>
      <p class="klein">Öffne deine Google-Tabelle, Menü „Podboard → Einrichten / Verbindung anzeigen“ und kopiere beide Werte hierher.</p>
      <label>Script-Adresse<textarea id="s-url" rows="3" autocomplete="off">${esc(vorschlag.url)}</textarea></label>
      <label>Schlüssel<input id="s-key" value="${esc(vorschlag.key)}" autocomplete="off"></label>`;
    knoepfe.innerHTML = (cfg && daten ? '<button data-aktion="zum-spiel">Abbrechen</button>' : '')
      + '<button class="haupt" data-aktion="verbinden">Verbinden</button>';
    return;
  }

  if (ansicht === 'einstellungen') {
    $('#titel').textContent = 'Einstellungen';
    main.innerHTML = `<h2>Einstellungen</h2>
      <p class="klein">Verbunden mit<br>…${esc(cfg.url.slice(-30))}</p>
      <p class="klein">${daten.decks.length} Decks, ${daten.commander.length} Commander geladen.</p>
      <p class="klein">Podboard Version ${VERSION}</p>
      <div class="weiter">
        <button data-aktion="neu-laden">Decks &amp; Commander neu laden</button>
        <button class="gefahr" data-aktion="reset">Verbindung zurücksetzen</button>
      </div>`;
    knoepfe.innerHTML = '<button class="haupt" data-aktion="zum-spiel">Zurück</button>';
    return;
  }

  const S = SCHRITTE[schritt];
  $('#titel').textContent = `${schritt + 1}/${SCHRITTE.length} · ${S.titel}`;
  main.innerHTML = `<h2>${S.titel}</h2>` + S.html();
  const letzter = schritt === SCHRITTE.length - 1;
  knoepfe.innerHTML = (schritt ? '<button data-aktion="zurueck">Zurück</button>' : '')
    + `<button class="haupt" data-aktion="weiter">${letzter ? 'Speichern' : 'Weiter'}</button>`;
}

function gehe(n) { schritt = n; meldung = ''; render(); scrollTo(0, 0); }

// ---------- Offline-Warteschlange (IndexedDB) ----------
// Jedes Spiel landet zuerst hier und wird erst gelöscht, wenn die Tabelle es bestätigt hat.
const db = new Promise((ok, err) => {
  const r = indexedDB.open('podboard', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('warte', { keyPath: 'syncId' });
  r.onsuccess = () => ok(r.result);
  r.onerror = () => err(r.error);
});
async function ablage(modus, f) {
  const d = await db;
  return new Promise((ok, err) => {
    const t = d.transaction('warte', modus), q = f(t.objectStore('warte'));
    t.oncomplete = () => ok(q.result);
    t.onerror = () => err(t.error);
  });
}
const warteschlange = () => ablage('readonly', st => st.getAll());
const einreihen = x => ablage('readwrite', st => st.put(x));
const entfernen = id => ablage('readwrite', st => st.delete(id));

let wartend = 0, syncLaeuft = false;

function zeigeSync(text = '') {
  const el = $('#sync');
  el.hidden = !wartend && !text;
  el.innerHTML = `<span>${wartend ? `${wartend} ${wartend === 1 ? 'Spiel wartet' : 'Spiele warten'} auf Sync. ` : ''}${esc(text)}</span>`
    + (wartend ? `<button data-aktion="sync"${syncLaeuft ? ' disabled' : ''}>Jetzt synchronisieren</button>` : '');
}

async function sync() {
  if (syncLaeuft || !cfg) return;
  syncLaeuft = true;
  let text = '';
  try {
    const liste = await warteschlange();
    wartend = liste.length;
    if (wartend && !navigator.onLine) text = 'Offline – wird gesendet, sobald Internet da ist.';
    else if (wartend) {
      zeigeSync('Sende …');
      for (const x of liste) {
        // Kein Grund zur Sorge: das Spiel bleibt gespeichert, der nächste Versuch kommt automatisch.
        try { await senden(x.format, x.zeile); } catch (e) { text = 'Noch nicht gesendet (' + e.message + '). Neuer Versuch automatisch in 1 Minute.'; break; }
        await entfernen(x.syncId); // auch bei „doppelt“: die Tabelle hat das Spiel schon
        wartend--;
        zeigeSync('Sende …');
      }
      if (!wartend) { text = 'Alles synchronisiert ✓'; laden().catch(() => {}); }
    }
  } finally {
    syncLaeuft = false;
    zeigeSync(text);
    if (text === 'Alles synchronisiert ✓') setTimeout(() => { if (!wartend) zeigeSync(); }, 4000);
  }
}

async function speichern() {
  try {
    await einreihen({ syncId: spiel.syncId, format: spiel.format, zeile: zeile() });
  } catch (e) {
    meldung = 'Konnte nicht auf dem Gerät speichern: ' + e.message; // Entwurf bleibt erhalten
    return render();
  }
  wartend++;
  neuesSpiel(); gehe(0);
  meldung = 'Gespeichert ✓';
  render();
  sync();
}

const AKTIONEN = {
  async verbinden() {
    const c = { url: $('#s-url').value.trim(), key: $('#s-key').value.trim() };
    vorschlag.url = c.url; vorschlag.key = c.key; // Eingaben bleiben bei Fehlermeldung stehen
    if (!URL_MUSTER.test(c.url)) { meldung = 'Die Script-Adresse muss mit https://script.google.com/macros/s/ beginnen und auf /exec enden.'; return render(); }
    if (!c.key) { meldung = 'Bitte den Schlüssel einfügen.'; return render(); }
    meldung = 'Verbinde … (kann bis zu 1 Minute dauern)'; render();
    document.querySelectorAll('#knoepfe button').forEach(b => { b.disabled = true; });
    try {
      await laden(c);
      cfg = c; localStorage.setItem('cfg', JSON.stringify(c));
      if (!spiel) neuesSpiel();
      ansicht = 'spiel'; meldung = `Verbunden ✓ ${daten.decks.length} Decks geladen.`;
    } catch (e) { meldung = 'Verbindung fehlgeschlagen: ' + e.message; }
    render();
  },
  einstellungen() { if (cfg && daten) { ansicht = 'einstellungen'; meldung = ''; render(); } },
  'zum-spiel'() { ansicht = 'spiel'; meldung = ''; render(); },
  async 'neu-laden'() {
    meldung = 'Lade …'; render();
    try { await laden(); meldung = 'Daten aktualisiert ✓'; } catch (e) { meldung = 'Fehler: ' + e.message; }
    render();
  },
  sync() { sync(); },
  reset() {
    // Sonst würden wartende Spiele später in die neue Tabelle gesendet.
    if (wartend) return alert(`Erst synchronisieren: ${wartend} Spiel(e) sind noch nicht in der Tabelle.`);
    if (!confirm('Verbindung zur Tabelle wirklich zurücksetzen? Script-Adresse und Schlüssel werden von diesem Gerät gelöscht.')) return;
    ['cfg', 'daten'].forEach(k => localStorage.removeItem(k));
    cfg = daten = null; vorschlag.url = vorschlag.key = ''; ansicht = 'setup'; meldung = ''; render();
  },
  neu() {
    if (ansicht !== 'spiel' || !confirm('Aktuelle Eingabe verwerfen und neues Spiel beginnen?')) return;
    neuesSpiel(); gehe(0);
  },
  zurueck() { gehe(schritt - 1); },
  weiter() {
    const f = SCHRITTE[schritt].fehlt();
    if (f) { meldung = f; return render(); }
    schritt === SCHRITTE.length - 1 ? speichern() : gehe(schritt + 1);
  },
};

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.vorschlagWert !== undefined) {
    const input = b.parentElement.previousElementSibling, p = input.dataset.pfad, wert = b.dataset.vorschlagWert;
    setze(p, wert);
    const m = /^gegner\.(\d+)\.deck$/.exec(p);
    if (m && spiel.format === 'Commander' && farbe.has(wert)) spiel.gegner[m[1]].farben = farbe.get(wert);
    return render();
  }
  if (b.dataset.pfad) {
    const p = b.dataset.pfad;
    setze(p, b.dataset.wert);
    if (p === 'format') { if (spiel.format === 'Commander') spiel.art = 'Casual'; // Commander ist immer Casual
      spiel.deck = ''; spiel.start = spiel.gewinner = spiel.platz = ''; gegnerAnpassen(); return gehe(1); }
    if (p === 'deck') return gehe(2);
    if (p === 'anzahl') gegnerAnpassen();
    meldung = '';
    return render();
  }
  if (b.dataset.farbe) {
    const g = spiel.gegner[parseInt(b.dataset.farbe, 10)], f = b.dataset.farbe.slice(-1);
    const neu = f === 'C' ? (g.farben === 'C' ? '' : 'C')
      : g.farben.replace('C', '').includes(f) ? g.farben.replace(f, '') : g.farben.replace('C', '') + f;
    g.farben = ordne(neu);
    return render();
  }
  AKTIONEN[b.dataset.aktion]?.();
});

document.addEventListener('input', e => {
  const p = e.target.dataset.pfad;
  if (p) { setze(p, e.target.value); if (p === 'datum') spiel.datumGewaehlt = true; merken(); }
  if (e.target.dataset.vorschlag) vorschlagen(e.target);
  if (e.target.dataset.filter !== undefined) {
    const n = norm(e.target.value.trim());
    e.target.nextElementSibling.querySelectorAll('.wahl').forEach(b => { b.hidden = !norm(b.dataset.wert).includes(n); });
  }
});

// Commander gewählt → Farben aus der CommanderDB übernehmen.
document.addEventListener('change', e => {
  const m = /^gegner\.(\d+)\.deck$/.exec(e.target.dataset.pfad || '');
  if (m && spiel.format === 'Commander' && farbe.has(e.target.value.trim())) {
    spiel.gegner[m[1]].farben = farbe.get(e.target.value.trim());
    render();
  }
});

// ---------- Vorschläge beim Tippen ----------
// Eigene Liste statt <datalist>: große Tipp-Flächen und Scryfall-Treffer, die sich beim Tippen aktualisieren.
const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
let scryTimer, scryAbbruch;

function lokaleTreffer(quelle, q) {
  const liste = quelle === 'commander' ? daten.commander.map(c => c[0]) : quelle === 'orte' ? daten.orte : daten.pauperGegner;
  const n = norm(q.trim());
  if (quelle === 'commander' && n.length < 2) return [];
  // Orte und Pauper-Gegner: die zuletzt genutzten auswählen, dann alphabetisch anzeigen.
  const abc = a => quelle === 'commander' ? a : [...a].sort((x, y) => x.localeCompare(y, 'de'));
  if (!n) return abc(liste.slice(0, 5));
  const vorne = liste.filter(x => norm(x).startsWith(n));
  const mitte = liste.filter(x => !norm(x).startsWith(n) && norm(x).includes(n));
  return abc([...vorne, ...mitte].filter(x => norm(x) !== n).slice(0, 8));
}

function zeigeVorschlaege(input, werte, karten = []) {
  document.querySelectorAll('.vorschlaege').forEach(b => { if (b.previousElementSibling !== input) b.remove(); });
  let box = input.nextElementSibling?.classList.contains('vorschlaege') ? input.nextElementSibling : null;
  if (!werte.length && !karten.length) return box?.remove();
  if (!box) { box = document.createElement('div'); box.className = 'vorschlaege'; input.after(box); }
  box.innerHTML = werte.map(w => `<button type="button" data-vorschlag-wert="${esc(w)}">${esc(w)}</button>`).join('')
    + karten.map(w => `<button type="button" data-vorschlag-wert="${esc(w)}" data-karte="1">${esc(w)} <small>Karte · Scryfall</small></button>`).join('');
}

function vorschlagen(input) {
  const quelle = input.dataset.vorschlag, q = input.value, lokal = lokaleTreffer(quelle, q);
  zeigeVorschlaege(input, lokal);
  clearTimeout(scryTimer); scryAbbruch?.abort();
  if (quelle !== 'pauper' || q.trim().length < 3 || !navigator.onLine) return;
  scryTimer = setTimeout(async () => {
    scryAbbruch = new AbortController();
    try {
      const r = await fetch('https://api.scryfall.com/cards/autocomplete?q=' + encodeURIComponent(q.trim()), { signal: scryAbbruch.signal });
      const karten = (await r.json()).data.filter(k => !lokal.includes(k)).slice(0, 6);
      if (input.isConnected && input.value === q) zeigeVorschlaege(input, lokal, karten);
    } catch { /* offline oder abgebrochen: lokale Vorschläge reichen */ }
  }, 300);
}

document.addEventListener('focusin', e => { if (e.target.dataset?.vorschlag) vorschlagen(e.target); });

// ---------- Start ----------
// Nach einem Update einmal zeigen, was neu ist (nicht bei der allerersten Einrichtung).
const letzteVersion = lese('version');
if (letzteVersion !== VERSION && (letzteVersion || cfg) && NEUIGKEITEN[VERSION]) {
  const d = document.createElement('dialog');
  d.innerHTML = `<h2>Neu in Version ${VERSION}</h2><ul>${NEUIGKEITEN[VERSION].map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <form method="dialog"><button class="haupt">OK</button></form>`;
  document.body.append(d);
  d.showModal();
}
localStorage.setItem('version', JSON.stringify(VERSION));
if (daten) listen();
// Frisch geöffnet (App war ganz geschlossen): immer leer bei der Formatauswahl starten. Im Hintergrund bleibt der Stand erhalten.
if (cfg && daten) neuesSpiel();
formatAusLink();
render();
// Im Hintergrund aktualisieren (offline bleibt der alte Stand); nicht neu zeichnen, sonst springt der Fokus beim Tippen.
if (cfg) laden().catch(() => {});
warteschlange().then(l => { wartend = l.length; zeigeSync(); sync(); });
addEventListener('online', sync);
// App lag im Hintergrund (z. B. über Nacht): beim Zurückholen das Datum auf heute setzen.
document.addEventListener('visibilitychange', () => { if (!document.hidden && datumAktualisieren()) render(); });
setInterval(() => { if (wartend) sync(); }, 60000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

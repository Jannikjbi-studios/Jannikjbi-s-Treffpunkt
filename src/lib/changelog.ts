/**
 * Changelog des Bewerbungsportals – ein Eintrag pro Tag, neueste zuerst.
 *
 * Ablauf:
 *  - Alles, was an einem Tag geändert wird, kommt in DEN Eintrag dieses Tages.
 *  - Jeder Tag bekommt eine Version: 1.0 (Start), danach 1.1, 1.2, …
 *  - Veröffentlicht wird ein Tag um 0 Uhr (Europe/Berlin) des Folgetags:
 *    ab dann auf der Website sichtbar und mit den Tagesaufgaben einmal auf Discord gepostet.
 *    Der laufende Tag ist noch nicht öffentlich.
 *
 * Stil: kurze Punkte, vorne ein fettes Stichwort („**Claimen** – …“).
 * Die `id` nie ändern – daran wird erkannt, ob schon gepostet wurde.
 */
export type ChangeKind = "neu" | "besser" | "fix";

export interface ChangelogItem {
  kind: ChangeKind;
  /** Discord-Markdown erlaubt (**fett**) */
  text: string;
}

export interface ChangelogEntry {
  /** Eindeutig und unveränderlich, z. B. "v1.0" */
  id: string;
  /** Versionsnummer ohne "v" */
  version: string;
  /** Tag der Änderungen, ISO (YYYY-MM-DD) */
  date: string;
  /** Optionaler Untertitel */
  title?: string;
  items: ChangelogItem[];
}

export const CHANGE_GROUPS: { kind: ChangeKind; label: string; emoji: string }[] = [
  { kind: "neu", label: "Neu", emoji: "✨" },
  { kind: "besser", label: "Verbessert", emoji: "🛠️" },
  { kind: "fix", label: "Behoben", emoji: "🐛" },
];

/** Punkte eines Eintrags nach Art gruppiert (leere Gruppen fallen weg). */
export function groupItems(items: ChangelogItem[]) {
  return CHANGE_GROUPS.map((g) => ({ ...g, items: items.filter((i) => i.kind === g.kind) })).filter((g) => g.items.length > 0);
}

/** Heutiges Datum in Deutschland als YYYY-MM-DD. */
export function todayBerlin(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * Wann ein Tag veröffentlicht wird (Admin-Bereich → Discord → Changelog):
 *  - `time` „00:00“ (Standard): wenn der Tag vorbei ist, also um 0 Uhr am Folgetag
 *  - andere Uhrzeit, z. B. „20:00“: am selben Tag um diese Uhrzeit (deutsche Zeit)
 *  - `through`: Admin hat „jetzt veröffentlichen“ gedrückt – alles bis zu diesem Tag ist sofort öffentlich
 */
export interface PublishRule {
  time: string;
  through: string;
}
export const DEFAULT_PUBLISH_RULE: PublishRule = { time: "00:00", through: "" };

function berlinMinutesNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

export function isPublished(entry: Pick<ChangelogEntry, "date">, now = new Date(), rule: PublishRule = DEFAULT_PUBLISH_RULE) {
  if (rule.through && entry.date <= rule.through) return true;
  const today = todayBerlin(now);
  if (entry.date < today) return true;
  if (entry.date > today || rule.time === "00:00") return false;
  const [h, m] = rule.time.split(":").map(Number);
  return berlinMinutesNow(now) >= h * 60 + m;
}

export function publishedEntries(now = new Date(), rule: PublishRule = DEFAULT_PUBLISH_RULE) {
  return CHANGELOG.filter((e) => isPublished(e, now, rule));
}

/** Für Hinweise: „heute um 20:00 Uhr“ bzw. „heute um Mitternacht“ */
export const publishTimeLabel = (rule: PublishRule) => (rule.time === "00:00" ? "um Mitternacht (nach Ende des Tages)" : `um ${rule.time} Uhr`);

export const versionLabel = (e: Pick<ChangelogEntry, "version">) => `Version ${e.version}`;

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "v1.0",
    version: "1.0",
    date: "2026-11-21",
    title: "Start: Bewerbungsportal für Jannikjbi's Treffpunkt",
    items: [
      { kind: "neu", text: "**Bewerbungsportal** – Bewerbungen fürs Team vom Treffpunkt: Login mit Discord, Formular in Ruhe ausfüllen (Entwurf wird gespeichert), Stand im Dashboard und per DM." },
      { kind: "neu", text: "**Stellen zum Start** – ✂️ Cutter, 📱 Social-Media, 🎙️ Stream-Mod (2 Plätze), ⚔️ Moderator (1 Platz) und 🎧 Supporter (1 Platz). Designer, Event-Team und Partner-Manager sind angelegt und öffnen später." },
      { kind: "neu", text: "**Fragen pro Stelle** – Fachfragen, Szenarien und ein kurzes Quiz passend zur Stelle, z. B. Schnitt und Shorts beim Cutter, Chat-Moderation auf Twitch, YouTube und Kick beim Stream-Mod." },
      { kind: "neu", text: "**Test-Rolle bis zur Probezeit** – Moderator und Supporter starten als 🗡️ Test-Mod bzw. 🧪 Test-Supporter. Bei „Probezeit bestanden“ tauscht der Bot die Rolle gegen ⚔️ Moderator bzw. 🎧 Supporter." },
      { kind: "neu", text: "**Gesperrt fürs Bewerben** – wer auf Discord ⛔ Blacklist oder 🚷 Team-Sperre hat, kann keine Bewerbung starten oder absenden." },
      { kind: "neu", text: "**Partner-Anfrage** – unter /partner können Server, Creator und Marken eine Zusammenarbeit vorschlagen (öffnet, sobald der Partner-Manager startet)." },
      { kind: "neu", text: "**Anträge** – unter /antraege, z. B. der Werbe-Antrag: Entwickler und Firmen fragen an, ob Jannik ihr Spiel, ihre App oder ihr Produkt vorstellt." },
      { kind: "neu", text: "**Einzelaufruf bei neuer Stelle** – öffnet eine Stelle, postet der Bot automatisch „Wir suchen …“ im Discord." },
      { kind: "neu", text: "**Content-Board** – Cutter reichen fertige Shorts ein, Social-Media hakt TikTok, YouTube und Instagram ab oder gibt mit Feedback zurück." },
      { kind: "neu", text: "**Live-Anzeige und Stream-Abdeckung** – die Startseite zeigt, wenn Jannik live ist; das Team sieht, welche Streamtage schon einen Stream-Mod haben." },
      { kind: "neu", text: "**Für das Team** – Übersicht als Tabelle und Kanban, Bewertungsbogen, Abstimmung, Gesprächstermine, Nachrichten mit Bausteinen, Einarbeitung und Probezeit – im Portal oder direkt in Discord." },
      { kind: "neu", text: "**Im Look von jannikjbi.de** – dunkles Design mit Amber-Akzent, Infos zu Jannik, Streamplan und Kanälen auf der Startseite." },
    ],
  },
];

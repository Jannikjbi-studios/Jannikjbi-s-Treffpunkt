/**
 * Inhalte für den Seed: die Stellen von Jannikjbi's Treffpunkt.
 *  - Offen zum Start: Cutter, Social-Media, Stream-Mod, Moderator, Supporter
 *  - Angelegt, aber geschlossen: Designer, Event-Team, Partner-Manager
 *  - Nicht ausgeschrieben (nur interne Beförderung): Head-Mod, Head-Support,
 *    Community-Manager, Admin, Co-Owner, Techniker – dafür gibt es keine Stelle.
 * Die Discord-Rollen-IDs (z. B. ✂️ Cutter, 🗡️ Test-Mod → ⚔️ Moderator, dazu 🧩 Team
 * bzw. 🎬 Content-Team) stehen bei jeder Stelle unter `discord` und lassen sich im
 * Portal unter „Positionen & Fragen“ ändern.
 */
import type { PositionStatus, TemplateCategory } from "@prisma/client";
import { GENERAL_SECTIONS, POSITION_SECTIONS, type SeedQuestion, type SeedSection } from "@/lib/setup/questions";
import { POSITION_QUIZ } from "@/lib/setup/quiz-questions";

export { GENERAL_SECTIONS, POSITION_SECTIONS, type SeedQuestion, type SeedSection };

export interface SeedPosition {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  status: PositionStatus;
  tasks: string[];
  requirements: string[];
  sections: SeedSection[];
  /** Mindestalter nur für diese Stelle (sonst Standard aus dem Admin-Bereich) */
  minAge?: number;
  /** Freie Plätze – sind sie mit Annahmen belegt, schließt die Stelle automatisch */
  seats?: number;
  /** Rolle bei Annahme / nach der Probezeit (Namen, als Hinweis für Admins) */
  roles: { accept: string; afterProbation?: string };
  /** Discord-Rollen-IDs von Jannikjbi's Treffpunkt: Annahme, nach der Probezeit, „Dazu“ */
  discord: { accept: string; pass?: string; extra: string[] };
}

/**
 * Sperrfrist nach einer Absage (Tage) je Stelle – je mehr Vertrauen die Stelle
 * braucht, desto länger, damit sich bis zur nächsten Bewerbung wirklich etwas ändern kann.
 */
export const POSITION_COOLDOWNS: Record<string, number> = {
  cutter: 30,
  "social-media": 30,
  "stream-mod": 30,
  moderator: 60, // Vertrauensposition – Verhalten über längere Zeit zählt
  supporter: 30,
  designer: 30,
  "event-team": 30,
  "partner-manager": 45,
};

const sectionsFor = (slug: string) => [...(POSITION_SECTIONS[slug] ?? []), ...(POSITION_QUIZ[slug] ? [POSITION_QUIZ[slug]] : [])];

export const POSITIONS: SeedPosition[] = [
  {
    slug: "cutter",
    title: "Cutter",
    tagline: "1–2 Shorts pro Stream – mit Untertiteln und großem Titel.",
    icon: "scissors",
    status: "OPEN",
    minAge: 15,
    roles: { accept: "✂️ Cutter" },
    discord: { accept: "1573541468466057418", extra: ["1573541476103888926"] },
    description:
      "Du schaust dir Janniks Streams an, findest die besten Momente aus dem GTA-RP auf NRW Roleplay und machst daraus Shorts, die man nicht wegwischt – im Hochformat, mit Untertiteln und großem Titel.",
    tasks: [
      "Pro Stream 1–2 Shorts aus dem VOD schneiden",
      "Untertitel und einen großen, gut lesbaren Titel einbauen",
      "Fertige Shorts an Social-Media übergeben",
      "Ideen für neue Formate einbringen",
    ],
    requirements: [
      "Mindestalter 15 Jahre",
      "Erfahrung mit einem Schnittprogramm (z. B. CapCut, DaVinci Resolve, Premiere)",
      "Gespür für Timing und Humor",
      "Zeit, Shorts meist bis zum nächsten Tag fertig zu haben",
    ],
    sections: sectionsFor("cutter"),
  },
  {
    slug: "social-media",
    title: "Social-Media",
    tagline: "Shorts auf YouTube und TikTok – Titel, Beschreibung, Hashtags.",
    icon: "phone",
    status: "OPEN",
    minAge: 15,
    roles: { accept: "📱 Social-Media" },
    discord: { accept: "1573541467748569168", extra: ["1573541476103888926"] },
    description:
      "Du sorgst dafür, dass die Shorts der Cutter auch gesehen werden: hochladen auf YouTube und TikTok, mit Titeln, Beschreibungen und Hashtags, die passen – und einem Auge auf die Kommentare.",
    tasks: [
      "Shorts auf YouTube und TikTok hochladen",
      "Titel, Beschreibung und Hashtags schreiben",
      "Upload-Zeiten planen und im Blick behalten, was gut läuft",
      "Kommentare im Auge behalten und Probleme ans Team geben",
    ],
    requirements: [
      "Mindestalter 15 Jahre",
      "Du kennst dich mit TikTok und YouTube Shorts aus",
      "Sicheres Deutsch in Titeln und Beschreibungen",
      "Zuverlässigkeit – Zugänge bleiben bei dir",
    ],
    sections: sectionsFor("social-media"),
  },
  {
    slug: "stream-mod",
    title: "Stream-Mod",
    tagline: "Chat auf Twitch, YouTube und Kick während der Streams.",
    icon: "microphone",
    status: "OPEN",
    seats: 2,
    roles: { accept: "🎙️ Stream-Mod" },
    discord: { accept: "1573541460895076482", extra: ["1573541472781996124"] },
    description:
      "Wenn Jannik live ist, hältst du den Chat sauber – auf Twitch, YouTube und Kick. Du begrüßt Leute, beantwortest Fragen, greifst bei Spam, Hate und Metagaming ein und lässt Jannik in Ruhe spielen.",
    tasks: [
      "Den Chat während der Streams moderieren (Twitch, YouTube, Kick)",
      "Spam, Hate und Metagaming/Stream-Sniping unterbinden",
      "Fragen im Chat beantworten und neue Leute willkommen heißen",
      "Auffälligkeiten an Moderation und Leitung melden",
    ],
    requirements: [
      "Mindestalter 16 Jahre",
      "Regelmäßig bei den Streams dabei (meist ab 17:30 Uhr)",
      "Ruhige, faire Art – auch wenn es im Chat hoch hergeht",
      "Grundwissen zu GTA RP (z. B. Metagaming) ist ein Plus",
    ],
    sections: sectionsFor("stream-mod"),
  },
  {
    slug: "moderator",
    title: "Moderator",
    tagline: "Discord moderieren, Reports bearbeiten, Warns vergeben.",
    icon: "sword",
    status: "OPEN",
    seats: 1,
    roles: { accept: "🗡️ Test-Mod", afterProbation: "⚔️ Moderator" },
    discord: { accept: "1573541459527999669", pass: "1573541457774649354", extra: ["1573541472781996124"] },
    description:
      "Du sorgst dafür, dass sich im Treffpunkt alle wohlfühlen. Du bearbeitest Reports, vergibst Warns und Timeouts nachvollziehbar – und hältst dich zurück, wenn einfach gute Stimmung ist. Du startest als Test-Mod, nach der Probezeit wirst du Moderator.",
    tasks: [
      "Den Discord-Server moderieren und auf die Regeln achten",
      "Reports bearbeiten und Beweise sichern",
      "Warns und Timeouts fair vergeben und dokumentieren",
      "Eng mit Supportern und der Leitung abstimmen",
    ],
    requirements: [
      "Mindestalter 16 Jahre",
      "Sehr gute Kenntnis der Regeln im Treffpunkt",
      "Neutralität – auch bei Freunden",
      "Funktionierendes Mikrofon für Absprachen auf Discord",
    ],
    sections: sectionsFor("moderator"),
  },
  {
    slug: "supporter",
    title: "Supporter",
    tagline: "Tickets und Voice-Support – die erste Anlaufstelle.",
    icon: "headset",
    status: "OPEN",
    seats: 1,
    roles: { accept: "🧪 Test-Supporter", afterProbation: "🎧 Supporter" },
    discord: { accept: "1573541464242262107", pass: "1573541463281635398", extra: ["1573541472781996124"] },
    description:
      "Du bist da, wenn jemand Hilfe braucht: Tickets beantworten, im Voice-Support erklären, Fragen zu Verifizierung, Rollen und Giveaways klären. Du startest als Test-Supporter, nach der Probezeit wirst du Supporter.",
    tasks: [
      "Tickets beantworten und sauber abschließen",
      "Voice-Support im Sprachkanal geben",
      "Neuen Mitgliedern beim Einstieg helfen (Verifizierung, Rollen, Kanäle)",
      "Wiederkehrende Probleme ans Team weitergeben",
    ],
    requirements: [
      "Mindestalter 16 Jahre",
      "Geduld und ein freundlicher, klarer Ton",
      "Funktionierendes Mikrofon für den Voice-Support",
      "Regelmäßig erreichbar",
    ],
    sections: sectionsFor("supporter"),
  },
  {
    slug: "designer",
    title: "Designer",
    tagline: "Thumbnails, Emotes und Overlays.",
    icon: "palette",
    status: "CLOSED",
    roles: { accept: "🎨 Designer" },
    discord: { accept: "1573541470059634748", extra: ["1573541476103888926"] },
    description:
      "Du gibst Jannik und dem Treffpunkt ein Gesicht: Thumbnails, die man anklickt, Emotes, die der Chat liebt, und Overlays, die im Stream gut aussehen. Diese Stelle öffnet später.",
    tasks: ["Thumbnails für YouTube gestalten", "Emotes für Twitch und Discord zeichnen", "Overlays und Stream-Grafiken bauen"],
    requirements: ["Mindestalter 16 Jahre", "Erfahrung mit einem Grafikprogramm", "Beispiele deiner Arbeiten"],
    sections: sectionsFor("designer"),
  },
  {
    slug: "event-team",
    title: "Event-Team",
    tagline: "Community-Abende, Turniere und Giveaways.",
    icon: "tent",
    status: "CLOSED",
    roles: { accept: "🎪 Event-Team" },
    discord: { accept: "1573541465349689455", extra: ["1573541472781996124"] },
    description:
      "Du bringst die Community zusammen – mit Community-Abenden, Turnieren und Giveaways. Diese Stelle öffnet, sobald der Treffpunkt etwa 100–150 Mitglieder hat.",
    tasks: ["Events planen, ankündigen und durchführen", "Giveaways fair organisieren", "Feedback einsammeln und auswerten"],
    requirements: ["Mindestalter 16 Jahre", "Organisationstalent", "Kreativität und Zuverlässigkeit"],
    sections: sectionsFor("event-team"),
  },
  {
    slug: "partner-manager",
    title: "Partner-Manager",
    tagline: "Partner-Anfragen aus den Tickets.",
    icon: "handshake",
    status: "CLOSED",
    roles: { accept: "🤝 Partner-Manager" },
    discord: { accept: "1573541466221969561", extra: ["1573541472781996124"] },
    description:
      "Du kümmerst dich um Partner-Anfragen, die über die Tickets reinkommen: prüfen, ob es passt, freundlich antworten und Partnerschaften betreuen. Diese Stelle öffnet später.",
    tasks: ["Partner-Anfragen aus den Tickets prüfen und beantworten", "Bestehende Partnerschaften betreuen", "Mit der Leitung abstimmen, was zum Treffpunkt passt"],
    requirements: ["Mindestalter 16 Jahre", "Sicherer, freundlicher Schreibstil", "Gespür dafür, was zu Jannik passt"],
    sections: sectionsFor("partner-manager"),
  },
];

/** Zustimmung zu KI-Punkten bei älteren Bewerbungen (siehe Admin-Freigabe im Bewertungsbogen) */
export const KI_CONSENT_TEMPLATE_TITLE = "KI-Einschätzung – Zustimmung";
/** Alter Text (bis 15.11.2026) – nur für die Migration */
export const KI_CONSENT_TEMPLATE_BODY_V1 =
  "Moin {name},\n\nkurze Frage zu deiner Bewerbung {bewerbungs_id} als **{position}**:\n\nWir nutzen im Bewerbungsportal seit Kurzem eine KI, die Bewerbungen nach festen Kriterien einschätzt (z. B. Kommunikation, Erfahrung, Umgang mit Szenarien) und das kurz begründet. Deine Bewerbung kam kurz vor dieser Neuerung bei uns an – deshalb fragen wir dich vorher.\n\n**Was dabei passiert:**\n- Nur deine Antworten und die Stelle gehen an die KI (Claude von Anthropic) – nicht dein Name, deine Discord-ID oder Bilder.\n- Die Punkte sind nur eine Orientierung fürs Team. Entscheiden tun immer wir Menschen, im Gespräch und in der Abstimmung.\n- Die Daten werden nicht zum Training der KI genutzt.\n\n**Sagst du Nein, hat das keinerlei Nachteile** – dann bewerten wir deine Bewerbung ganz normal ohne KI.\n\nWenn du einverstanden bist, antworte einfach direkt im Portal unter „Meine Bewerbungen“ mit **„Ja“**. Mehr dazu steht in der Datenschutzerklärung im Portal.";
/** Neuer Text: Antwort per Knopf im Portal (Pop-up) statt „Ja“ schreiben */
export const KI_CONSENT_TEMPLATE_BODY =
  "Moin {name},\n\nkurze Frage zu deiner Bewerbung {bewerbungs_id} als **{position}**:\n\nWir nutzen im Bewerbungsportal seit Kurzem eine KI, die Bewerbungen nach festen Kriterien einschätzt (z. B. Kommunikation, Erfahrung, Umgang mit Szenarien) und das kurz begründet. Deine Bewerbung kam kurz vor dieser Neuerung bei uns an – deshalb fragen wir dich vorher.\n\n**Was dabei passiert:**\n- Nur deine Antworten und die Stelle gehen an die KI (Claude von Anthropic) – nicht dein Name, deine Discord-ID oder Bilder.\n- Die Punkte sind nur eine Orientierung fürs Team. Entscheiden tun immer wir Menschen, im Gespräch und in der Abstimmung.\n- Die Daten werden nicht zum Training der KI genutzt.\n\n**Sagst du Nein, hat das keinerlei Nachteile** – dann bewerten wir deine Bewerbung ganz normal ohne KI.\n\nIm Portal unter „Meine Bewerbungen“ ({dashboard_link}) erscheint dazu ein Fenster – tippe dort einfach auf **Erlauben** oder **Ablehnen**. Mehr dazu steht in der Datenschutzerklärung im Portal.";

/**
 * Mitgelieferte Team-Bausteine (Wortwahl „Bewerbung als {position}“, Gespräch,
 * Probezeit). Weitere Bewerbungsarten hätten eigene (kinds-seed.ts).
 * Für alle Arten gelten die KI-Zustimmung und GLOBAL_TEMPLATES.
 */
export const TEAM_ONLY_TEMPLATE_TITLES = [
  "Bewerbung ist angekommen",
  "Kurzer Zwischenstand",
  "Rückfrage zu deinen Antworten",
  "Terminvorschlag gesucht",
  "Erinnerung an den Gesprächstermin",
  "Wir warten auf deine Antwort",
  "Tipps für die nächste Bewerbung",
  "Portfolio / Link fehlt",
  "Einladung zum Gespräch",
  "Willkommen im Team",
  "Probezeit-Infos",
  "Absage (freundlich)",
  "Absage – zu wenig Zeit",
  "Absage – Mindestalter",
];

/**
 * Weitere Team-Bausteine (kinds = team), damit jede Kategorie gut gefüllt ist.
 * Werden per Migration ergänzt, falls sie (nach Titel) fehlen.
 */
export const TEAM_EXTRA_TEMPLATES: { category: TemplateCategory; title: string; body: string }[] = [
  {
    category: "EINGANG",
    title: "Bewerbung wird geprüft",
    body: "Moin {name},\n\nkurzes Update: Deine Bewerbung als **{position}** ({bewerbungs_id}) liegt jetzt bei {teammitglied} auf dem Tisch. Wir schauen sie uns in Ruhe an und melden uns – {bearbeitungszeit}.",
  },
  {
    category: "RUECKFRAGE",
    title: "Rückfrage zur Verfügbarkeit",
    body: "Moin {name},\n\neine Frage zu deiner Bewerbung als {position}: Wie viele Stunden pro Woche kannst du ungefähr einplanen, und an welchen Tagen bzw. Uhrzeiten bist du meistens online?\n\nAntworte einfach direkt im Portal unter „Meine Bewerbungen“.",
  },
  {
    category: "RUECKFRAGE",
    title: "Rückfrage zu einem Szenario",
    body: "Moin {name},\n\nbei einem Szenario aus deiner Bewerbung würden wir gern noch genauer verstehen, wie du vorgehen würdest:\n\n{grund}\n\nBeschreib uns bitte Schritt für Schritt, was du machen würdest – einfach im Portal antworten.",
  },
  {
    category: "EINLADUNG",
    title: "Termin bitte selbst buchen",
    body: "Moin {name},\n\ndeine Bewerbung als **{position}** hat uns überzeugt – wir möchten dich gern kennenlernen.\n\nSuch dir im Portal unter „Meine Bewerbungen“ einen freien Termin fürs Gespräch aus: {dashboard_link}\n\nDas Gespräch läuft auf unserem Discord im Sprachkanal, plan etwa 20–30 Minuten ein.",
  },
  {
    category: "EINLADUNG",
    title: "Gespräch verschoben",
    body: "Moin {name},\n\nbei uns ist leider etwas dazwischengekommen – wir müssen euer Gespräch verschieben. Neuer Termin: **{termin}**.\n\nPasst das nicht, sag kurz im Portal Bescheid, dann finden wir einen anderen.",
  },
  {
    category: "ANNAHME",
    title: "Probezeit bestanden",
    body: "Moin {name},\n\ngute Nachrichten: Deine Probezeit als **{position}** ist vorbei – und du bleibst fest im Team. Falls es zu deiner Stelle eine Rolle nach der Probezeit gibt (z. B. Test-Mod → Moderator), bekommst du sie gleich auf Discord. Danke für deinen Einsatz, schön, dass du dabei bist!",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage nach dem Gespräch",
    body: "Moin {name},\n\ndanke für das Gespräch und deine Zeit. Wir haben uns intensiv beraten und uns diesmal für andere Bewerber entschieden.\n\n{grund}\n\nDu kannst dich für {position} ab dem **{sperrfrist}** wieder bewerben – wir freuen uns, wenn du es nochmal versuchst.",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage – Stelle besetzt",
    body: "Moin {name},\n\ndanke für deine Bewerbung als {position}. Wir haben die freien Plätze inzwischen besetzt und können deshalb gerade niemanden mehr aufnehmen – an dir lag es nicht.\n\nWenn die Stelle wieder öffnet, steht das im Portal. Du kannst dich dort auch per DM benachrichtigen lassen.",
  },
  {
    category: "ERINNERUNG",
    title: "Erinnerung: Termin buchen",
    body: "Moin {name},\n\nkurze Erinnerung: Für deine Bewerbung als {position} fehlt noch ein Gesprächstermin. Such dir bitte in den nächsten Tagen einen freien Termin im Portal aus: {dashboard_link}",
  },
  {
    category: "SONSTIGES",
    title: "Danke fürs Gespräch",
    body: "Moin {name},\n\ndanke für das angenehme Gespräch! Wir besprechen uns jetzt im Team und melden uns {bearbeitungszeit} mit einer Entscheidung.",
  },
];

/**
 * Globale Bausteine – erscheinen bei jeder Bewerbungsart (kinds leer).
 * Neutral formuliert („deine Bewerbung“), ohne Gespräch, Probezeit o. Ä.
 */
export const GLOBAL_TEMPLATES: { category: TemplateCategory; title: string; body: string }[] = [
  {
    category: "EINGANG",
    title: "Danke für deine Geduld",
    body: "Moin {name},\n\ngerade kommen bei uns sehr viele Bewerbungen rein – deshalb dauert es bei {bewerbungs_id} etwas länger. Du musst nichts weiter tun, wir melden uns hier im Portal und per DM. Den aktuellen Stand siehst du jederzeit unter {dashboard_link}.",
  },
  {
    category: "RUECKFRAGE",
    title: "Antworten etwas ausführlicher",
    body: "Moin {name},\n\neinige deiner Antworten waren uns noch etwas zu knapp, um dich richtig einschätzen zu können:\n\n{grund}\n\nSchreib uns gern ein paar Sätze mehr dazu – einfach direkt im Portal unter „Meine Bewerbungen“ antworten.",
  },
  {
    category: "RUECKFRAGE",
    title: "Bitte dem Discord beitreten",
    body: "Moin {name},\n\nwir haben gesehen, dass du gerade nicht auf unserem Discord bist. Alles Weitere zu deiner Bewerbung läuft aber über Discord – tritt bitte wieder bei: {discord_link}",
  },
  {
    category: "RUECKFRAGE",
    title: "Discord-DMs öffnen",
    body: "Moin {name},\n\nunser Bot konnte dir keine Direktnachricht schicken. Damit du nichts verpasst: In Discord auf den Treffpunkt rechtsklicken → „Privatsphäre-Einstellungen“ → „Direktnachrichten“ einschalten. Bis dahin findest du alles unter {dashboard_link}.",
  },
  {
    category: "ERINNERUNG",
    title: "Letzte Erinnerung",
    body: "Moin {name},\n\nwir haben zu deiner Bewerbung {bewerbungs_id} noch nichts von dir gehört. Wenn bis in ein paar Tagen keine Antwort kommt, schließen wir sie. Du kannst dich danach natürlich jederzeit neu bewerben.",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage – Angaben unvollständig",
    body: "Moin {name},\n\ndanke für deine Bewerbung als {position}. Leider fehlen uns zu viele Angaben, um sie fair zu bewerten – auch auf Nachfrage kam nichts mehr.\n\nDu kannst dich ab dem **{sperrfrist}** gern nochmal bewerben, dann am besten mit ausführlicheren Antworten.",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage – kopierte Antworten",
    body: "Moin {name},\n\nbei deiner Bewerbung als {position} sind uns Antworten aufgefallen, die nicht in deinen eigenen Worten geschrieben sind. Uns ist wichtig, dich kennenzulernen – nicht einen fertigen Text.\n\nDeshalb können wir die Bewerbung so nicht annehmen. Ab dem **{sperrfrist}** kannst du dich wieder bewerben.",
  },
  {
    category: "SONSTIGES",
    title: "Danke für deine Nachricht",
    body: "Moin {name},\n\ndanke für deine Nachricht – ist angekommen. Wir schauen sie uns an und melden uns hier im Portal.",
  },
  {
    category: "SONSTIGES",
    title: "Zurückziehen bestätigt",
    body: "Moin {name},\n\nwir haben gesehen, dass du deine Bewerbung {bewerbungs_id} zurückgezogen hast – alles gut. Wenn du es dir anders überlegst, kannst du dich jederzeit wieder bewerben.",
  },
  {
    category: "SONSTIGES",
    title: "Stelle gerade geschlossen",
    body: "Moin {name},\n\nfür {position} nehmen wir gerade keine neuen Bewerbungen an. Sobald die Stelle wieder offen ist, steht das im Portal – dort kannst du dich auch per DM benachrichtigen lassen.",
  },
];

export const TEMPLATES: { category: TemplateCategory; title: string; body: string; kinds?: string[] }[] = [
  {
    category: "EINGANG",
    title: "Bewerbung ist angekommen",
    body: "Moin {name},\n\ndeine Bewerbung als **{position}** ({bewerbungs_id}) ist bei uns angekommen. Wir schauen sie uns in Ruhe an und melden uns – {bearbeitungszeit}.",
  },
  {
    category: "EINGANG",
    title: "Kurzer Zwischenstand",
    body: "Moin {name},\n\nkurzer Zwischenstand zu deiner Bewerbung {bewerbungs_id}: Wir sind dran, es dauert nur etwas länger als gedacht. Du hast nichts falsch gemacht – wir melden uns.",
  },
  {
    category: "RUECKFRAGE",
    title: "Rückfrage zu deinen Antworten",
    body: "Moin {name},\n\nwir haben uns deine Bewerbung als {position} angeschaut und noch eine Rückfrage:\n\n{grund}\n\nAntworte einfach direkt im Portal unter „Meine Bewerbungen“.",
  },
  {
    category: "RUECKFRAGE",
    title: "Portfolio / Link fehlt",
    body: "Moin {name},\n\nbei deiner Bewerbung fehlt uns noch ein Blick auf deine bisherigen Arbeiten. Schick uns gern einen Link oder ein paar Screenshots – einfach im Portal antworten.",
  },
  {
    category: "RUECKFRAGE",
    title: KI_CONSENT_TEMPLATE_TITLE,
    body: KI_CONSENT_TEMPLATE_BODY,
  },
  {
    category: "EINLADUNG",
    title: "Einladung zum Gespräch",
    body: "Moin {name},\n\ndeine Bewerbung als **{position}** hat uns gefallen – wir wollen dich kennenlernen.\n\n**Termin:** {termin}\n**Wo:** Discord, Sprachkanal für Bewerbungsgespräche\n**Mit:** {teammitglied}\n\nPlan etwa 20–30 Minuten ein. Passt der Termin nicht, sag einfach kurz Bescheid.",
  },
  {
    category: "EINLADUNG",
    title: "Terminvorschlag gesucht",
    body: "Moin {name},\n\nwir würden gern ein kurzes Gespräch mit dir führen. Schreib uns im Portal zwei, drei Zeiten, an denen du diese Woche kannst – dann machen wir was fest.",
  },
  {
    category: "ANNAHME",
    title: "Willkommen im Team",
    body: "Moin {name},\n\nwillkommen im Team! Du bist ab sofort als **{position}** im Treffpunkt dabei.\n\nDu bekommst gleich deine Rolle auf dem Discord. {teammitglied} meldet sich bei dir für die Einarbeitung. Bis dahin: schau dich in den Team-Kanälen um und lies dir die Team-Infos durch.\n\nSchön, dass du dabei bist.",
  },
  {
    category: "ANNAHME",
    title: "Probezeit-Infos",
    body: "Die ersten Wochen sind deine Probezeit (bei Moderator und Supporter mit der Test-Rolle). Das ist kein Test, sondern Zeit zum Ankommen: Frag viel, schau dir Abläufe an, und sag Bescheid, wenn dir etwas komisch vorkommt.",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage (freundlich)",
    body: "Moin {name},\n\ndanke für deine Bewerbung als {position} und die Zeit, die du reingesteckt hast. Diesmal hat es leider nicht gepasst.\n\n{grund}\n\nFür {position} gilt nach einer Absage eine Sperrfrist von **{sperrfrist_tage}** – du kannst dich also ab dem **{sperrfrist}** wieder bewerben. Wir freuen uns, wenn du weiter im Treffpunkt und in Janniks Streams dabei bist.",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage – zu wenig Zeit",
    body: "Moin {name},\n\nehrlich gesagt: Für {position} brauchen wir gerade Leute, die regelmäßig mehr Zeit mitbringen, als du angegeben hast. Das ist keine Kritik an dir – es passt nur aktuell nicht.\n\nWenn sich bei dir etwas ändert, bewirb dich gern nochmal: Die Sperrfrist für {position} beträgt **{sperrfrist_tage}**, also ab dem **{sperrfrist}**.",
  },
  {
    category: "ABLEHNUNG",
    title: "Absage – Mindestalter",
    body: "Moin {name},\n\nfür {position} gilt bei uns ein Mindestalter (siehe Stellenbeschreibung im Portal). Deshalb können wir deine Bewerbung leider noch nicht annehmen. Danke trotzdem für dein Interesse – und viel Spaß weiterhin im Treffpunkt.",
  },
  {
    category: "SONSTIGES",
    title: "Tipps für die nächste Bewerbung",
    body: "**Ein paar Tipps fürs nächste Mal:**\n- Schreib in deinen eigenen Worten – kopierte Texte fallen auf.\n- Bei Szenario-Fragen zählt dein Weg, nicht die perfekte Antwort.\n- Lieber konkret als allgemein: Beispiele helfen uns sehr.\n- Bei Cutter, Social-Media und Designer: Zeig uns gern Arbeitsproben.",
  },
  {
    category: "ERINNERUNG",
    title: "Erinnerung an den Gesprächstermin",
    body: "Moin {name},\n\nkurze Erinnerung: Dein Gespräch ist am **{termin}** auf unserem Discord. Bis dann!",
  },
  {
    category: "ERINNERUNG",
    title: "Wir warten auf deine Antwort",
    body: "Moin {name},\n\nwir hatten dir zu deiner Bewerbung {bewerbungs_id} eine Frage gestellt und noch nichts gehört. Melde dich gern in den nächsten Tagen im Portal – sonst schließen wir die Bewerbung.",
  },
];

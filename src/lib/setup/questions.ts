/**
 * Zentrale Fragen-Definition.
 *
 * - Allgemeine Fragen sind EINMAL definiert (positionId = null) und werden für
 *   jede Position automatisch vorangestellt – nie pro Position kopiert.
 * - Positionsspezifische Abschnitte enthalten nur Fachfragen.
 * - Jede Frage und jeder Abschnitt hat einen eindeutigen Key. Über den Key
 *   werden Duplikate entfernt und allgemeine Antworten wiederverwendet.
 */
import type { QuestionType } from "@prisma/client";
import { STREAM_DAYS } from "@/lib/team/stream-coverage";

export interface SeedQuestion {
  key: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  /** Nur QUIZ: richtige Option */
  correctOption?: string;
}

export interface SeedSection {
  key: string;
  title: string;
  description?: string;
  questions: SeedQuestion[];
}

export const GENERAL_SECTIONS: SeedSection[] = [
  {
    key: "about",
    title: "Über dich",
    description: "Ein paar Basics, damit wir wissen, mit wem wir es zu tun haben.",
    questions: [
      {
        key: "availability_hours",
        label: "Wie viele Stunden pro Woche kannst du realistisch fürs Team einplanen?",
        type: "SELECT",
        helpText: "Ehrlich bleiben – lieber weniger zusagen und dafür verlässlich sein.",
        options: ["unter 3 Stunden", "3–6 Stunden", "6–10 Stunden", "über 10 Stunden"],
      },
      {
        key: "availability_times",
        label: "Wann bist du meistens erreichbar?",
        type: "MULTI_SELECT",
        helpText: "Jannik ist meist Mo, Di, Fr und Sa ab 17:30 Uhr live.",
        options: ["Wochentags nachmittags", "Wochentags abends (ab 17:30)", "Am Wochenende", "Unterschiedlich"],
        minValue: 1,
      },
      {
        key: "community_since",
        label: "Seit wann kennst du Jannikjbi und den Treffpunkt?",
        type: "SELECT",
        options: ["Gerade erst entdeckt", "Seit ein paar Wochen", "Seit ein paar Monaten", "Seit über einem Jahr"],
      },
      {
        key: "about_me",
        label: "Erzähl kurz etwas über dich.",
        type: "LONG_TEXT",
        placeholder: "Was machst du so, wie bist du auf Jannik gestoßen, was ist dir wichtig?",
        minLength: 80,
        maxLength: 1500,
      },
    ],
  },
  {
    key: "experience",
    title: "Erfahrung & Motivation",
    description: "Kein Lebenslauf nötig. Uns interessiert, wie du tickst.",
    questions: [
      {
        key: "experience_teams",
        label: "Welche Erfahrung hast du in anderen Teams, Communities oder Projekten?",
        type: "LONG_TEXT",
        helpText:
          "Discord-Server, Streams, Content, Vereine, Projekte – alles zählt. Keine Erfahrung ist auch okay, dann sag das.",
        minLength: 40,
        maxLength: 2000,
      },
      {
        key: "motivation",
        label: "Warum willst du ausgerechnet im Team vom Treffpunkt mitmachen?",
        type: "LONG_TEXT",
        minLength: 100,
        maxLength: 2500,
      },
      { key: "strengths", label: "Was sind deine Stärken?", type: "LONG_TEXT", minLength: 40, maxLength: 1200 },
      {
        key: "weaknesses",
        label: "Woran arbeitest du noch?",
        type: "LONG_TEXT",
        helpText: "Jeder hat Baustellen. Wir finden es stark, wenn man sie kennt.",
        minLength: 40,
        maxLength: 1200,
      },
    ],
  },
];

/**
 * Früher allgemeine Szenarien (für alle Stellen gleich). Seit 11/2026 hat jede
 * Stelle eigene Szenarien – dieser Abschnitt wird nur noch von den Migrationen
 * gebraucht (Altbestände erkennen und archivieren).
 */
export const RETIRED_GENERAL_SCENARIOS: SeedSection =
{
    key: "scenarios",
    title: "Szenarien",
    description: "Es gibt keine perfekte Antwort. Wir wollen sehen, wie du denkst.",
    questions: [
      {
        key: "scenario_insult",
        label: "Jemand beleidigt dich – im Ticket, im Voice oder ingame. Wie reagierst du?",
        type: "SCENARIO",
        minLength: 80,
        maxLength: 2000,
      },
      {
        key: "scenario_rule_friend",
        label: "Ein Freund von dir bricht eine Regel und du bekommst es mit. Was machst du?",
        type: "SCENARIO",
        minLength: 80,
        maxLength: 2000,
      },
      {
        key: "scenario_team_conflict",
        label: "Zwei Teammitglieder sind sich öffentlich uneinig über eine Entscheidung. Wie gehst du damit um?",
        type: "SCENARIO",
        minLength: 80,
        maxLength: 2000,
      },
    ],
  };

const SZENARIO_HINWEIS = "Es gibt keine perfekte Antwort. Wir wollen sehen, wie du denkst.";
const scenario = (key: string, label: string) => ({ key, label, type: "SCENARIO" as const, minLength: 80, maxLength: 2000 });

/** Fachfragen je Position (Slug → Abschnitte). Keine Wiederholung allgemeiner Fragen! */
export const POSITION_SECTIONS: Record<string, SeedSection[]> = {
  cutter: [
    {
      key: "cutter.fach",
      title: "Schnitt",
      questions: [
        {
          key: "cutter.software",
          label: "Mit welchen Programmen schneidest du?",
          type: "MULTI_SELECT",
          options: ["CapCut", "DaVinci Resolve", "Adobe Premiere Pro", "After Effects", "Vegas", "Andere"],
          minValue: 1,
        },
        {
          key: "cutter.experience",
          label: "Wie viel Erfahrung hast du mit Shorts (TikTok, YouTube Shorts, Reels)?",
          type: "SELECT",
          options: ["Noch keine – ich will es lernen", "Ein paar für mich selbst", "Regelmäßig, auch für andere"],
        },
        {
          key: "cutter.portfolio",
          label: "Link zu Clips oder Shorts, die du geschnitten hast",
          type: "URL",
          required: false,
          placeholder: "Optional – z. B. TikTok, YouTube, Google Drive",
        },
        {
          key: "cutter.moment",
          label: "Woran erkennst du im Stream einen Moment, der ein gutes Short wird? Beschreib gern ein Beispiel aus Janniks Streams.",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 2000,
        },
        {
          key: "cutter.workflow",
          label: "Wie gehst du vor – vom VOD bis zum fertigen Short mit Untertiteln und großem Titel?",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 2000,
        },
        {
          key: "cutter.pace",
          label: "Schaffst du 1–2 Shorts pro Stream, meist bis zum nächsten Tag?",
          type: "SELECT",
          options: ["Ja, zuverlässig", "Meistens", "Eher nur ab und zu"],
        },
      ],
    },
    {
      key: "cutter.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("cutter.scenario_viewer", "Im besten Moment des Streams ist ein Zuschauer-Name mit einer Beleidigung im Chat zu sehen. Was machst du mit dem Clip?"),
        scenario("cutter.scenario_feedback", "Jannik findet dein Short zu lang und den Titel langweilig. Wie gehst du mit dem Feedback um?"),
      ],
    },
  ],
  "social-media": [
    {
      key: "social-media.fach",
      title: "Social Media",
      questions: [
        {
          key: "social-media.platforms",
          label: "Auf welchen Plattformen kennst du dich gut aus?",
          type: "MULTI_SELECT",
          options: ["TikTok", "YouTube Shorts", "Instagram Reels", "Twitch", "Bluesky"],
          minValue: 1,
        },
        {
          key: "social-media.own_accounts",
          label: "Hast du schon eigene Kanäle oder Kanäle für andere betreut? Wenn ja, welche?",
          type: "LONG_TEXT",
          required: false,
          minLength: 20,
          maxLength: 1500,
          placeholder: "Optional – Link oder kurze Beschreibung",
        },
        {
          key: "social-media.title",
          label: "Ein Short zeigt, wie Jannik als Taxifahrer auf NRW Roleplay einen völlig verwirrten Fahrgast hat. Schreib Titel, Beschreibung und Hashtags dafür.",
          type: "LONG_TEXT",
          minLength: 60,
          maxLength: 1500,
        },
        {
          key: "social-media.timing",
          label: "Wann und wie oft würdest du Shorts hochladen – und warum?",
          type: "LONG_TEXT",
          minLength: 60,
          maxLength: 1500,
        },
      ],
    },
    {
      key: "social-media.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("social-media.scenario_hate", "Unter einem Short sammeln sich gemeine Kommentare über Jannik. Was tust du?"),
        scenario("social-media.scenario_mistake", "Du merkst nach dem Hochladen, dass im Titel ein peinlicher Fehler ist und das Video schon gut läuft. Was machst du?"),
      ],
    },
  ],
  "stream-mod": [
    {
      key: "stream-mod.fach",
      title: "Stream-Moderation",
      questions: [
        {
          key: "stream-mod.platforms",
          label: "Auf welchen Plattformen hast du schon einen Chat moderiert?",
          type: "MULTI_SELECT",
          options: ["Twitch", "YouTube", "Kick", "Noch nirgends"],
          minValue: 1,
        },
        {
          key: "stream-mod.tools",
          label: "Welche Mod-Werkzeuge kennst du?",
          type: "MULTI_SELECT",
          options: ["Timeout & Bann", "Slow-Mode / Follower-Mode", "Blockierte Begriffe / AutoMod", "Chat-Bots (z. B. Nightbot, StreamElements)", "Noch keine"],
          minValue: 1,
        },
        {
          key: "stream-mod.days",
          label: "An welchen Streamtagen kannst du meistens im Chat sein (ab 17:30 Uhr)?",
          type: "MULTI_SELECT",
          helpText: "Daraus sieht das Team, welcher Streamtag noch einen Mod braucht.",
          options: STREAM_DAYS,
          minValue: 1,
        },
        {
          key: "stream-mod.timeout_or_ban",
          label: "Wann gibst du einen Timeout und wann einen Bann? Nenn je ein Beispiel.",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 1500,
        },
      ],
    },
    {
      key: "stream-mod.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("stream-mod.scenario_meta", "Jemand schreibt im Chat, wo sich ein anderer RP-Charakter gerade versteckt (Metagaming/Stream-Sniping). Was machst du?"),
        scenario("stream-mod.scenario_raid", "Ein fremder Raid kommt rein und flutet den Chat mit Spam und Beleidigungen. Wie gehst du Schritt für Schritt vor?"),
        scenario("stream-mod.scenario_regular", "Ein bekannter Stammzuschauer, mit dem du dich gut verstehst, wird im Chat immer wieder beleidigend. Was tust du?"),
      ],
    },
  ],
  moderator: [
    {
      key: "moderator.fach",
      title: "Moderation",
      questions: [
        {
          key: "moderator.rules_knowledge",
          label: "Wie gut kennst du die Regeln im Treffpunkt (#regeln)?",
          type: "SELECT",
          options: ["Einmal überflogen", "Gelesen und verstanden", "Kenne ich sehr genau"],
        },
        {
          key: "moderator.experience",
          label: "Hast du schon einen Discord-Server moderiert? Wenn ja: welchen, wie groß und wie lange?",
          type: "LONG_TEXT",
          minLength: 40,
          maxLength: 1500,
        },
        {
          key: "moderator.warn_steps",
          label: "Wie sieht für dich der Weg von der Verwarnung über den Timeout bis zum Bann aus?",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 1500,
        },
        {
          key: "moderator.documentation",
          label: "Wie dokumentierst du einen Report oder Warn, damit jemand anderes ihn später nachvollziehen kann?",
          type: "LONG_TEXT",
          minLength: 60,
          maxLength: 1500,
        },
      ],
    },
    {
      key: "moderator.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("moderator.scenario_report", "Zwei Mitglieder melden sich gegenseitig – beide sagen, der andere hat angefangen. Wie gehst du vor?"),
        scenario("moderator.scenario_friend", "Ein guter Freund von dir verstößt gegen eine Regel und du bist gerade der einzige Mod online. Was machst du?"),
        scenario("moderator.scenario_dm_ad", "Ein neues Mitglied schickt mehreren Leuten per DM Werbung für einen anderen Server. Wie reagierst du?"),
      ],
    },
  ],
  supporter: [
    {
      key: "supporter.fach",
      title: "Support",
      questions: [
        {
          key: "supporter.tickets",
          label: "Wie viele Support-Tickets hast du ungefähr schon bearbeitet?",
          type: "SELECT",
          options: ["Noch keine", "Unter 50", "50–500", "Über 500"],
        },
        {
          key: "supporter.voice",
          label: "Wie wohl fühlst du dich, jemandem im Sprachkanal (Voice-Support) zu helfen?",
          type: "SELECT",
          options: ["Eher unwohl – lieber schriftlich", "Geht klar", "Sehr gern"],
        },
        {
          key: "supporter.newbie",
          label: "Jemand ist neu im Treffpunkt und findet sich nicht zurecht (Verifizierung, Rollen, Kanäle). Wie erklärst du es?",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 2000,
        },
        {
          key: "supporter.escalation",
          label: "Welche Tickets löst du selbst – und wann gibst du eins an die Moderation oder die Leitung weiter?",
          type: "LONG_TEXT",
          minLength: 60,
          maxLength: 1500,
        },
      ],
    },
    {
      key: "supporter.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("supporter.scenario_impatient", "Jemand beleidigt dich im Ticket, weil sein Giveaway-Gewinn noch nicht angekommen ist. Wie reagierst du?"),
        scenario("supporter.scenario_unsure", "Im Ticket fragt jemand etwas, bei dem du dir selbst nicht sicher bist. Was antwortest du?"),
        scenario("supporter.scenario_voice", "Im Voice-Support ist die Person sehr aufgeregt und redet ständig dazwischen. Wie gehst du vor?"),
      ],
    },
  ],
  designer: [
    {
      key: "designer.fach",
      title: "Design",
      questions: [
        {
          key: "designer.what",
          label: "Was gestaltest du am liebsten?",
          type: "MULTI_SELECT",
          options: ["Thumbnails", "Emotes", "Overlays & Stream-Grafiken", "Banner & Social-Media-Grafiken", "Logos"],
          minValue: 1,
        },
        {
          key: "designer.software",
          label: "Mit welchen Programmen arbeitest du?",
          type: "MULTI_SELECT",
          options: ["Photoshop", "Canva", "Figma", "Affinity", "Procreate", "GIMP", "Andere"],
          minValue: 1,
        },
        { key: "designer.portfolio", label: "Link zu deinen Arbeiten", type: "URL", placeholder: "https://…" },
        {
          key: "designer.samples",
          label: "Beispielbilder (optional)",
          type: "FILE",
          required: false,
          helpText: "Bis zu 5 Bilder (JPG, PNG, WebP), je max. 8 MB. Metadaten werden automatisch entfernt.",
        },
      ],
    },
    {
      key: "designer.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("designer.scenario_thumbnail", "Für ein YouTube-Video über Janniks Rettungsdienst-Schicht brauchst du ein Thumbnail. Beschreib deine Idee."),
        scenario("designer.scenario_changes", "Jannik möchte am fertigen Overlay noch einiges ändern, obwohl du es gut findest. Wie gehst du damit um?"),
      ],
    },
  ],
  "event-team": [
    {
      key: "event-team.fach",
      title: "Events",
      questions: [
        {
          key: "event-team.idea",
          label: "Beschreib einen Community-Abend, ein Turnier oder ein Giveaway, das du im Treffpunkt veranstalten würdest.",
          type: "LONG_TEXT",
          minLength: 100,
          maxLength: 2500,
        },
        {
          key: "event-team.planning",
          label: "Wie bereitest du das vor: Was brauchst du, mit wem stimmst du dich ab und wie kündigst du es an?",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 2000,
        },
        {
          key: "event-team.giveaway",
          label: "Worauf achtest du bei einem Giveaway, damit es fair bleibt?",
          type: "LONG_TEXT",
          minLength: 60,
          maxLength: 1500,
        },
      ],
    },
    {
      key: "event-team.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("event-team.scenario_crowd", "Beim Community-Abend kommen doppelt so viele Leute wie geplant und es wird chaotisch. Was tust du?"),
        scenario("event-team.scenario_disruption", "Während eines Turniers stören ein paar Leute absichtlich den Ablauf. Was machst du?"),
      ],
    },
  ],
  "partner-manager": [
    {
      key: "partner-manager.fach",
      title: "Partnerschaften",
      questions: [
        {
          key: "partner-manager.experience",
          label: "Hast du schon Partnerschaften oder Kooperationen betreut (Discord-Server, Creator, Marken)?",
          type: "LONG_TEXT",
          minLength: 40,
          maxLength: 1500,
        },
        {
          key: "partner-manager.criteria",
          label: "Woran erkennst du, ob ein Partner zum Treffpunkt und zu Jannik passt – und wann sagst du Nein?",
          type: "LONG_TEXT",
          minLength: 80,
          maxLength: 2000,
        },
        {
          key: "partner-manager.reply",
          label: "Ein Server mit 300 Mitgliedern fragt per Ticket nach einer Partnerschaft. Schreib deine erste Antwort.",
          type: "LONG_TEXT",
          minLength: 60,
          maxLength: 1500,
        },
      ],
    },
    {
      key: "partner-manager.szenarien",
      title: "Szenarien",
      description: SZENARIO_HINWEIS,
      questions: [
        scenario("partner-manager.scenario_pushy", "Ein Partner drängelt jeden Tag im Ticket, wann seine Werbung endlich gepostet wird. Wie gehst du damit um?"),
        scenario("partner-manager.scenario_bad", "Nach ein paar Wochen fällt auf, dass ein Partner-Server Leute aus dem Treffpunkt abwirbt. Was tust du?"),
      ],
    },
  ],
};

/** Allgemeine Abschnitts-Keys (für Wiederverwendung). */
export const GENERAL_SECTION_KEYS = GENERAL_SECTIONS.map((s) => s.key);

/**
 * Migration: alte Fragetexte (normalisiert) → neuer Key. Fragen ohne Treffer
 * und ohne Key bleiben unverändert (z. B. eigene Fragen aus dem Builder).
 */
export const LEGACY_LABELS: Record<string, string> = {
  "wie sollen wir dich nennen": "callname",
  "wie viele stunden pro woche kannst du realistisch furs team einplanen": "availability_hours",
  "wann bist du meistens erreichbar": "availability_times",
  "erzahl kurz etwas uber dich": "about_me",
  "welche erfahrung hast du in anderen teams oder projekten": "experience_teams",
  "was sind deine starken": "strengths",
  "woran arbeitest du noch": "weaknesses",
  "ein spieler beleidigt dich im support ticket wie reagierst du": "scenario_insult",
  "jemand beleidigt dich im ticket im voice oder ingame wie reagierst du": "scenario_insult",
  "ein freund von dir bricht eine regel und du bekommst es mit was machst du": "scenario_rule_friend",
  "zwei teammitglieder sind sich offentlich uneinig uber eine entscheidung wie gehst du damit um": "scenario_team_conflict",
};

/** Diese Fragen entfallen (werden archiviert, Antworten bleiben erhalten). */
export const RETIRED_KEYS = ["callname"];

/** Alte Abschnittstitel → Key (für Migration). */
export const LEGACY_SECTION_TITLES: Record<string, string> = {
  "uber dich": "about",
  "erfahrung motivation": "experience",
  szenarien: "scenarios",
};

/** Normalisierung für Text-Vergleiche (Groß/Klein, Umlaute, Satzzeichen). */
export function normalizeLabel(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

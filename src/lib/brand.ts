/**
 * Marke & Creator-Infos an einer Stelle – übernommen von jannikjbi.de.
 * Ohne Server-Abhängigkeiten (auch im Browser nutzbar). Ändert sich etwas
 * (Streamzeiten, Kanäle), reicht eine Anpassung hier.
 */
export const BRAND = {
  /** Name des Discord-Servers */
  name: "Jannikjbi's Treffpunkt",
  /** Kurzform (Handy, App-Name) */
  short: "Treffpunkt",
  /** Creator */
  creator: "Jannikjbi",
  /** Aussprache laut jannikjbi.de */
  pronunciation: "Jannik-Jott-Be-I",
  /** Unterzeile wie auf jannikjbi.de */
  tagline: "GTA Roleplay · NRW Roleplay",
  /** Signatur unter Nachrichten an Bewerber */
  signature: "dein Team von Jannikjbi's Treffpunkt",
  /** Kurztext für Discord-Fußzeilen */
  footer: "Jannikjbi's Treffpunkt",
  home: "Oldenburg",
} as const;

export interface SocialLink {
  key: "twitch" | "youtube" | "tiktok" | "instagram" | "kofi" | "bluesky" | "steam";
  label: string;
  handle: string;
  url: string;
}

/** Kanäle von Jannikjbi (jannikjbi.de → Community). */
export const SOCIALS: SocialLink[] = [
  { key: "twitch", label: "Twitch", handle: "@jannikjbi", url: "https://www.twitch.tv/jannikjbi" },
  { key: "youtube", label: "YouTube", handle: "@Jannikjbi", url: "https://www.youtube.com/@Jannikjbi" },
  { key: "tiktok", label: "TikTok", handle: "@jannikjbi.tv", url: "https://www.tiktok.com/@jannikjbi.tv" },
  { key: "instagram", label: "Instagram · RP-Clips", handle: "@jannikjbi.rp", url: "https://www.instagram.com/jannikjbi.rp/" },
  { key: "kofi", label: "Ko-fi", handle: "@jannikjbi", url: "https://ko-fi.com/jannikjbi" },
  { key: "bluesky", label: "Bluesky", handle: "@jannikjbi.bsky.social", url: "https://bsky.app/profile/jannikjbi.bsky.social" },
];

export const TWITCH_URL = SOCIALS[0].url;

/** Streamplan (jannikjbi.de/#streamplan) – kurz für die Startseite. */
export const STREAM_PLAN: { day: string; what: string; live: boolean }[] = [
  { day: "Mo", what: "Rettungsdienst · UKK", live: true },
  { day: "Di", what: "Taxi", live: true },
  { day: "Mi", what: "Frei", live: false },
  { day: "Do", what: "Frei", live: false },
  { day: "Fr", what: "Taxi & Familie", live: true },
  { day: "Sa", what: "Joker-Tag – der Chat entscheidet", live: true },
  { day: "So", what: "Frei", live: false },
];
export const STREAM_TIME = "ab 17:30 Uhr";

/** Was der Discord-Server bietet (jannikjbi.de/discord). */
export const SERVER_FEATURES = [
  { title: "Live & Videos", text: "Ping, wenn Jannik live geht oder ein neues Video kommt – ohne Suchen." },
  { title: "Spiele-Deals", text: "Gratis-Spiele und Rabatte von Steam, Epic und GOG in eigenen Kanälen." },
  { title: "Level & Rollen", text: "XP sammeln – von „Aktiv“ bis „Urgestein“." },
  { title: "Giveaways & Events", text: "Verlosungen und Community-Abende." },
  { title: "Support per Ticket", text: "Fragen oder Probleme? Ticket auf, das Team hilft." },
  { title: "Du bestimmst mit", text: "Vorschläge, Umfragen, Geburtstage und Selbst-Rollen." },
] as const;

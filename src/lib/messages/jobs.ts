/**
 * Stellenaufrufe für Discord – Components V2, im Stil eines klassischen Embeds
 * (ein durchgehender Textblock, Linie, Fußzeile):
 *  - Gesamtaufruf „Wir suchen neue Teammitglieder!“ mit allen offenen Stellen
 *  - Einzelaufruf „Wir suchen <Stelle>!“ für eine Position
 * Beide werden aus den Positionen erzeugt (Texte wie auf der Website) und vom
 * Bot bei Änderungen an den Positionen automatisch aktualisiert.
 */
import type { APIActionRowComponent, APIButtonComponentWithURL, APIComponentInContainer, RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { BRAND_COLOR, separator, text, truncate, v2Message } from "@/lib/messages/embed";
import { accentInt, bannerVersion } from "@/lib/messages/position-accent";
import { KIND_POSITION_SLUG, kindOf, positionHref } from "@/lib/kinds";

/** Öffentlicher Link: feste Stelle einer Art (Partner-Anfrage → /partner), Anträge unter /antraege, sonst /positionen. */
const publicPath = (slug: string, kind: string) => (KIND_POSITION_SLUG[kindOf(kind).key] === slug ? kindOf(kind).path : positionHref(slug, kind));

export interface JobPosition {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  status: "OPEN" | "CLOSED" | "HIDDEN";
  tasks: string[];
  requirements: string[];
  minAge: number | null;
  /** Discord-Rolle der Position – wird als Erwähnung angezeigt (ohne Ping) */
  acceptRoleId: string | null;
  /** Art (team, promo = Antrag, partner) – eigene Texte, Knopf und Link im Einzelaufruf */
  type?: { key: string } | null;
}

interface Opts {
  appUrl: string;
  defaultMinAge: number;
  updatedAt?: Date;
}

const ICON_EMOJI: Record<string, string> = {
  scissors: "✂️",
  phone: "📱",
  microphone: "🎙️",
  sword: "⚔️",
  palette: "🎨",
  tent: "🎪",
  handshake: "🤝",
  megaphone: "📣",
  headset: "🎧",
  shield: "🛡️",
  code: "💻",
  camera: "📸",
  cube: "🧱",
  confetti: "🎉",
  users: "👥",
  id: "🪪",
  flask: "🧪",
};
export const jobEmoji = (icon: string) => ICON_EMOJI[icon] ?? "📌";

const NL = "\n";
const roleOrTitle = (p: JobPosition) => (p.acceptRoleId ? `<@&${p.acceptRoleId}>` : `**${p.title}**`);
const isHttps = (url: string) => /^https:\/\//.test(url);

/** Anforderungen, die bei allen offenen Stellen gleich sind (z. B. Mindestalter). */
function commonRequirements(open: JobPosition[], defaultMinAge: number) {
  if (!open.length) return [];
  const [first, ...rest] = open;
  const common = first.requirements.filter((r) => rest.every((p) => p.requirements.includes(r)));
  // Mindestalter kann je Stelle abweichen (z. B. Cutter ab 15) – dann das niedrigste mit Hinweis
  const ages = open.map((p) => p.minAge ?? defaultMinAge);
  const min = Math.min(...ages);
  const ageLine = ages.every((a) => a === min) ? `Mindestens ${min} Jahre alt` : `Mindestens ${min} Jahre alt (je nach Stelle)`;
  return common.some((r) => /mindestalter|jahre/i.test(r)) ? common : [ageLine, ...common];
}

function footer(opts: Opts): APIComponentInContainer[] {
  const stand = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(opts.updatedAt ?? new Date());
  // Wie beim Embed: Linie, dann kleine Zeile
  return [separator(true, 1), text(`-# Jannikjbi's Treffpunkt · Stand: ${stand}`)];
}

function buttonRows(buttons: APIButtonComponentWithURL[]): APIActionRowComponent<APIButtonComponentWithURL>[] {
  const rows: APIActionRowComponent<APIButtonComponentWithURL>[] = [];
  for (let i = 0; i < buttons.length && i < 25; i += 5) rows.push({ type: 1, components: buttons.slice(i, i + 5) });
  return rows;
}

/** Gesamtaufruf: alle offenen Stellen, Voraussetzungen, Statusübersicht – ein Block. */
export function buildJobsMessage(positions: JobPosition[], opts: Opts): RESTPostAPIChannelMessageJSONBody {
  const open = positions.filter((p) => p.status === "OPEN");

  const parts: string[] = [
    "## Wir suchen neue Teammitglieder!",
    `🔍 ${open.length ? "Aktuell suchen wir Unterstützung in folgenden Bereichen:" : "Gerade sind alle Stellen besetzt – schau bald wieder vorbei."}`,
  ];

  // Je offene Stelle: Titel, Beschreibung, Aufgaben (Platz gleichmäßig verteilt)
  const budget = Math.floor(2300 / Math.max(open.length, 1));
  for (const p of open) {
    const tasks = p.tasks.length ? `${NL}Aufgaben: ${p.tasks.join(", ")}.` : "";
    parts.push("", truncate(`${jobEmoji(p.icon)} ${roleOrTitle(p)}:${NL}${p.description}${tasks}`, budget));
  }

  const reqs = commonRequirements(open, opts.defaultMinAge);
  if (reqs.length) {
    parts.push("", "✅ **Das solltest du mitbringen:**", ...reqs.map((r) => `🔹 ${r}`), "-# Weitere Voraussetzungen stehen bei der jeweiligen Stelle im Bewerbungsportal.");
  }

  parts.push(
    "",
    // Geschlossene Stellen tauchen bewusst nicht auf (wie auf der Website)
    ...(open.length ? ["📊 **Statusübersicht – Offene Stellen:**", ...open.map((p) => `${jobEmoji(p.icon)} ${p.title}: 🟢 Offen`), ""] : []),
    "Wenn du dich angesprochen fühlst, bewirb dich direkt im **Bewerbungsportal** – Login mit Discord, dauert ca. 15–25 Minuten. Wir freuen uns auf dich! 🎉",
    "",
    "Euer Treffpunkt-Team",
  );

  const children: APIComponentInContainer[] = [text(truncate(parts.join(NL), 3800))];
  if (isHttps(opts.appUrl)) {
    children.push(
      ...buttonRows([
        { type: 2, style: 5, label: "Zum Bewerbungsportal", url: opts.appUrl },
        ...open.map((p) => ({ type: 2 as const, style: 5 as const, label: truncate(`${p.title} bewerben`, 80), url: `${opts.appUrl}/positionen/${p.slug}`, emoji: { name: jobEmoji(p.icon) } })),
      ]),
    );
  }
  children.push(...footer(opts));
  return v2Message(BRAND_COLOR, children);
}

/** Einzelaufruf „Wir suchen <Stelle>!“ – wie das Beispiel, ein durchgehender Block. */
export function buildSpotlightMessage(p: JobPosition, opts: Opts): RESTPostAPIChannelMessageJSONBody {
  const open = p.status === "OPEN";
  const kind = kindOf(p.type?.key).key;
  const isTeam = kind === "team";
  // Stelle: „Wir suchen …!“ – Antrag/Partner-Anfrage: Titel als Aufruf („📣 Sponsoring-Anfrage“)
  const headline = isTeam ? `## Wir suchen ${roleOrTitle(p)}! ${jobEmoji(p.icon)}` : `## ${jobEmoji(p.icon)} ${p.title}`;
  const parts: string[] = [headline, `${p.tagline} ${p.description}`];
  if (p.tasks.length) parts.push("", isTeam ? "📋 **Deine Aufgaben:**" : "📋 **So läuft's:**", ...p.tasks.map((t) => `> ${t}`));
  if (isTeam) {
    const reqs = p.requirements.length ? p.requirements : [`Mindestens ${p.minAge ?? opts.defaultMinAge} Jahre alt`];
    parts.push("", "🔧 **Das solltest du mitbringen:**", ...reqs.map((r) => `> ${r}`));
  } else if (p.requirements.length) {
    parts.push("", "📌 **Gut zu wissen:**", ...p.requirements.map((r) => `> ${r}`));
  }
  parts.push(
    "",
    "📩 **Interesse?**",
    open
      ? isTeam
        ? "Bewirb dich direkt im **Bewerbungsportal** – Login mit Discord, dauert ca. 15–25 Minuten."
        : "Das Formular findest du direkt im **Portal** – Login mit Discord, dauert ca. 5 Minuten."
      : isTeam
        ? "Die Stelle ist gerade geschlossen. Schau bald wieder vorbei – wir melden uns hier, sobald sie wieder offen ist."
        : "Gerade geschlossen. Wir melden uns hier, sobald es losgeht.",
    "",
    "Mit freundlichen Grüßen",
    "Euer Treffpunkt-Team",
  );

  const children: APIComponentInContainer[] = [];
  // Banner der Stelle oben (Bild aus /api/banner/<slug>, nur mit https-Adresse – Discord lädt es von dort)
  if (isHttps(opts.appUrl)) {
    children.push({ type: 12, items: [{ media: { url: `${opts.appUrl}/api/banner/${p.slug}?v=${bannerVersion(p)}` }, description: isTeam ? `Wir suchen: ${p.title}` : p.title }] });
  }
  children.push(text(truncate(parts.join(NL), 3800)));
  if (open && isHttps(opts.appUrl)) {
    children.push(
      ...buttonRows([
        {
          type: 2,
          style: 5,
          label: isTeam ? `Jetzt als ${truncate(p.title, 60)} bewerben` : kindOf(kind).applyLabel,
          url: `${opts.appUrl}${publicPath(p.slug, kind)}`,
          emoji: { name: jobEmoji(p.icon) },
        },
      ]),
    );
  }
  children.push(...footer(opts));
  // Akzentleiste in der Farbe der Stelle (wie das Banner)
  return v2Message(accentInt(p.icon), children);
}

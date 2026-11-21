/**
 * Bewerbungsarten. Jannikjbi's Treffpunkt hat nur eine: Team-Bewerbungen
 * (Cutter, Social-Media, Stream-Mod, Moderator, Supporter …). Jede Art ist ein
 * ApplicationType (key) mit eigenen Stellen, Abschnitten und Fragen. Hier steht,
 * was pro Art dazugehört – ohne Server-Abhängigkeiten (auch im Browser nutzbar).
 *
 *  - team: Formular → Gespräch → Annahme, danach Einarbeitung/Probezeit/Pate
 *
 * Weitere Arten lassen sich hier ergänzen (eigener Key, Stellen im Formularbaukasten).
 */
export type KindKey = "team";

export type ConfirmationKey = "voice" | "rules" | "unpaid" | "truth" | "privacy";

export interface KindConfig {
  key: KindKey;
  /** Kurzname, z. B. für Filter und Abzeichen */
  label: string;
  /** „Team-Bewerbung“ … */
  noun: string;
  /** Gibt es die Phase „Gespräch“? */
  interview: boolean;
  /** Einarbeitung, Probezeit, Pate, Team-Verzeichnis, Begrüßung im Teamchat, Zusatzrollen/Präfix */
  teamFeatures: boolean;
  /** Bestätigungen vor dem Absenden */
  confirmations: ConfirmationKey[];
  /** Status-Hinweis nach der Annahme (Bewerber-Dashboard) */
  acceptedHint: string;
  /** Kurzbeschreibung für Startseite und Übersicht */
  teaser: string;
  /** Öffentliche Seite (Kurz-Link) */
  path: string;
  /** Eigene Eingangsbestätigung (DM + Portal); ohne Angabe: Text aus dem Admin-Bereich */
  confirmationTemplate?: string;
}

export const KINDS: Record<KindKey, KindConfig> = {
  team: {
    key: "team",
    label: "Team",
    noun: "Team-Bewerbung",
    interview: true,
    teamFeatures: true,
    confirmations: ["voice", "rules", "unpaid", "truth", "privacy"],
    acceptedHint: "Willkommen im Team! Alles Weitere bekommst du per Nachricht.",
    teaser:
      "Cutter, Social-Media, Stream-Mod, Moderation und Support – hilf mit, dass Content und Community laufen. Ehrenamtlich, mit kurzem Gespräch auf Discord.",
    path: "/#positionen",
  },
};

export const KIND_KEYS = Object.keys(KINDS) as KindKey[];

/** Konfiguration zu einem ApplicationType-Key (unbekannt → wie Team). */
export function kindOf(key: string | null | undefined): KindConfig {
  return KINDS[(key ?? "team") as KindKey] ?? KINDS.team;
}

/** Feste Stellen einzelner Arten (Art mit genau einer „Stelle“) – derzeit keine. */
export const KIND_POSITION_SLUG: Partial<Record<KindKey, string>> = {};

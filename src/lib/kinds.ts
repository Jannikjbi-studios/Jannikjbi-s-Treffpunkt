/**
 * Bewerbungsarten. Jannikjbi's Treffpunkt hat nur eine: Team-Bewerbungen
 * (Cutter, Social-Media, Stream-Mod, Moderator, Supporter …). Jede Art ist ein
 * ApplicationType (key) mit eigenen Stellen, Abschnitten und Fragen. Hier steht,
 * was pro Art dazugehört – ohne Server-Abhängigkeiten (auch im Browser nutzbar).
 *
 *  - team:    Formular → Gespräch → Annahme, danach Einarbeitung/Probezeit/Pate
 *  - partner: Partner-Anfrage (Server, Creator, Marke) → Team antwortet, kein Gespräch, keine Team-Rollen
 *
 * Weitere Arten lassen sich hier ergänzen (eigener Key, Stellen im Formularbaukasten).
 */
export type KindKey = "team" | "partner";

export type ConfirmationKey = "voice" | "rules" | "unpaid" | "truth" | "privacy" | "parents";

/** Unter diesem Alter braucht die Einwilligung das Okay der Eltern (Art. 8 DSGVO, Deutschland: 16). */
export const PARENTAL_CONSENT_AGE = 16;

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
  /** Text für den Start-Knopf auf der Seite der Stelle */
  applyLabel: string;
  /** „Du bewirbst dich als“ … (Einleitung im Formular) */
  formIntro: string;
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
    applyLabel: "Jetzt bewerben",
    formIntro: "Du bewirbst dich als",
  },
  partner: {
    key: "partner",
    label: "Partner",
    noun: "Partner-Anfrage",
    interview: false,
    teamFeatures: false,
    confirmations: ["truth", "privacy"],
    acceptedHint: "Wir machen das zusammen! Alles Weitere besprechen wir per Nachricht.",
    teaser: "Du hast einen Server, einen Kanal oder eine Idee, die zu Jannik passt? Stell eine Partner-Anfrage – das Team meldet sich.",
    path: "/partner",
    applyLabel: "Anfrage stellen",
    formIntro: "Deine",
    confirmationTemplate: `Moin {name},

danke für deine Partner-Anfrage an Jannikjbi's Treffpunkt – sie ist am {datum} bei uns eingegangen.

**Anfrage-ID:** {bewerbungs_id}

Unser Team schaut sich deine Idee in Ruhe an und meldet sich hier per DM oder im Portal – {bearbeitungszeit}. Den Stand siehst du jederzeit in deinem Dashboard.

Moin, dein Team von Jannikjbi's Treffpunkt`,
  },
};

export const KIND_KEYS = Object.keys(KINDS) as KindKey[];

/** Konfiguration zu einem ApplicationType-Key (unbekannt → wie Team). */
export function kindOf(key: string | null | undefined): KindConfig {
  return KINDS[(key ?? "team") as KindKey] ?? KINDS.team;
}

/** Feste Stellen einzelner Arten (Art mit genau einer „Stelle“). */
export const KIND_POSITION_SLUG: Partial<Record<KindKey, string>> = { partner: "partner-anfrage" };

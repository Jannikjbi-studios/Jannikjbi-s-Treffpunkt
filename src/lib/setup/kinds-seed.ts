/**
 * Startinhalte für weitere Bewerbungsarten neben „Team“: Bewerbungsart,
 * eine „Stelle“ je Art (Partner-Anfrage startet geschlossen, Werbe-Antrag offen),
 * Abschnitte mit Fragen und passende Nachrichtenbausteine.
 */
import type { PositionStatus, TemplateCategory } from "@prisma/client";
import type { SeedSection } from "@/lib/setup/questions";
import type { KindKey } from "@/lib/kinds";

export interface KindSeed {
  type: { key: KindKey; name: string; description: string };
  position: {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    icon: string;
    status: PositionStatus;
    cooldownDays: number;
    tasks: string[];
    requirements: string[];
    sections: SeedSection[];
    /** Nur diese Discord-Rollen (und Admins) sehen die Anträge – leer = ganzes Team */
    teamRoleIds?: string[];
  };
  templates: { category: TemplateCategory; title: string; body: string }[];
}

/** Partner-Anfrage: Server, Creator oder Marken schlagen eine Zusammenarbeit vor. Startet geschlossen. */
export const PARTNER_SEED: KindSeed = {
  type: { key: "partner", name: "Partner-Anfrage", description: "Kooperationen mit Jannikjbi's Treffpunkt" },
  position: {
    slug: "partner-anfrage",
    title: "Partner-Anfrage",
    tagline: "Server, Creator oder Marke? Schlag uns eine Zusammenarbeit vor.",
    description:
      "Du hast einen Discord-Server, einen Kanal oder eine Idee, die zu Jannik und dem Treffpunkt passt? Erzähl uns, wer ihr seid und was ihr vorhabt. Das Team schaut sich jede Anfrage an und meldet sich – ein Gespräch gibt es nur, wenn es passt.",
    icon: "handshake",
    status: "CLOSED",
    cooldownDays: 30,
    tasks: [
      "Formular ausfüllen: wer ihr seid und was ihr vorschlagt",
      "Das Team prüft, ob es zum Treffpunkt passt",
      "Antwort per DM und im Portal – bei Fragen schreiben wir dir",
    ],
    requirements: [
      "Ihr passt zu Jannik und der Community (kein NSFW, kein Hate, keine Glücksspiel-Werbung)",
      "Ehrliche Angaben zu Größe und Zielgruppe",
      "Du bist auf dem Treffpunkt-Discord, damit wir dich erreichen",
    ],
    sections: [
      {
        key: "partner.about",
        title: "Über euch",
        description: "Ein paar Basics, damit wir wissen, mit wem wir es zu tun haben.",
        questions: [
          { key: "partner.type", label: "Was seid ihr?", type: "SELECT", options: ["Discord-Server", "Streamer / Content Creator", "Marke / Unternehmen", "Sonstiges"] },
          { key: "partner.name", label: "Name des Servers, Kanals oder der Marke", type: "SHORT_TEXT", maxLength: 100 },
          { key: "partner.link", label: "Link (Einladung, Kanal oder Website)", type: "URL", placeholder: "https://…" },
          {
            key: "partner.size",
            label: "Wie groß seid ihr ungefähr? (Mitglieder bzw. Follower)",
            type: "SELECT",
            options: ["unter 100", "100–500", "500–2.000", "über 2.000"],
          },
          { key: "partner.topic", label: "Worum geht es bei euch – und wer ist eure Zielgruppe?", type: "LONG_TEXT", minLength: 60, maxLength: 1500 },
        ],
      },
      {
        key: "partner.idea",
        title: "Eure Idee",
        description: "Je konkreter, desto schneller können wir antworten.",
        questions: [
          {
            key: "partner.proposal",
            label: "Was schlagt ihr vor?",
            type: "LONG_TEXT",
            minLength: 80,
            maxLength: 2000,
            placeholder: "z. B. Partner-Posts tauschen, gemeinsames Event, Gast im Stream …",
          },
          { key: "partner.benefit", label: "Was haben beide Seiten davon?", type: "LONG_TEXT", minLength: 60, maxLength: 1500 },
          { key: "partner.timing", label: "Gibt es einen Zeitraum oder eine Frist?", type: "SHORT_TEXT", required: false, maxLength: 200, placeholder: "Optional" },
        ],
      },
    ],
  },
  templates: [
    {
      category: "EINGANG",
      title: "Partner – Anfrage angekommen",
      body: "Moin {name},\n\ndanke für deine Partner-Anfrage ({bewerbungs_id})! Wir schauen sie uns in Ruhe an und melden uns – {bearbeitungszeit}.",
    },
    {
      category: "RUECKFRAGE",
      title: "Partner – Rückfrage",
      body: "Moin {name},\n\nzu deiner Partner-Anfrage haben wir noch eine Frage:\n\n{grund}\n\nAntworte einfach direkt hier im Portal.",
    },
    {
      category: "EINLADUNG",
      title: "Partner – kurzer Austausch",
      body: "Moin {name},\n\neure Idee klingt spannend! Lass uns kurz auf Discord sprechen – schreib uns im Portal zwei, drei Zeiten, an denen du kannst.",
    },
    {
      category: "ERINNERUNG",
      title: "Partner – Wir warten auf deine Antwort",
      body: "Moin {name},\n\nwir hatten dir zu deiner Partner-Anfrage {bewerbungs_id} eine Frage gestellt und noch nichts gehört. Melde dich gern in den nächsten Tagen – sonst schließen wir die Anfrage.",
    },
    {
      category: "ANNAHME",
      title: "Partner – Zusage",
      body: "Moin {name},\n\nwir sind dabei! 🤝 Danke für eure Anfrage – wir freuen uns auf die Zusammenarbeit.\n\n**So geht's weiter:**\n{grund}\n\nBei Fragen schreib uns einfach hier im Portal.",
    },
    {
      category: "ABLEHNUNG",
      title: "Partner – Absage",
      body: "Moin {name},\n\ndanke für eure Partner-Anfrage! Diesmal passt es leider nicht:\n\n{grund}\n\nIhr könnt ab dem **{sperrfrist}** gern eine neue Anfrage stellen.",
    },
    {
      category: "SONSTIGES",
      title: "Partner – Infos für Partner",
      body: "**Für Partner:**\n- Werbung und Partner-Posts laufen nur nach Absprache mit dem Team.\n- Affiliate-Links und Werbung kennzeichnen wir immer.\n- Ansprechpartner ist der Partner-Manager bzw. die Leitung im Ticket.",
    },
  ],
};

/** ⚜️ Owner und Co-Owner – Werbe-Anträge sehen nur sie und die Admins. */
const LEAD_ROLE_IDS = ["1573541450833199276", "1573541451806285917"];

/** Werbe-Antrag: Jannik soll ein Spiel, eine App oder ein Produkt vorstellen (Discord-Server → Partner-Anfrage). Startet offen, nur für die Leitung sichtbar. */
export const PROMO_SEED: KindSeed = {
  type: { key: "promo", name: "Werbe-Antrag", description: "Anträge, damit Jannik ein Spiel, eine App oder ein Projekt vorstellt" },
  position: {
    slug: "werbe-antrag",
    title: "Werbe-Antrag",
    tagline: "Spiel, App oder Produkt? Frag an, ob Jannik es vorstellt.",
    description:
      "Du entwickelst ein Spiel, hast eine App oder ein Produkt und möchtest, dass Jannik es im Stream, in einem Short oder auf Social Media vorstellt? Erzähl kurz, worum es geht und was du dir vorstellst. Jannik schaut sich jeden Antrag selbst an und sagt nur zu, wenn es zu ihm und der Community passt – egal ob bezahlt oder nicht. Für Discord-Server und Partnerschaften gibt es die Partner-Anfrage.",
    icon: "megaphone",
    status: "OPEN",
    cooldownDays: 14,
    teamRoleIds: LEAD_ROLE_IDS,
    tasks: [
      "Kurzes Formular: was vorgestellt werden soll und was du dir vorstellst",
      "Jannik prüft, ob es zu ihm und der Community passt",
      "Antwort per DM und im Portal – bei Fragen melden wir uns",
    ],
    requirements: [
      "Passt zu Jannik und der Community – kein NSFW, kein Hate, kein Glücksspiel, keine Wetten oder Krypto",
      "Ehrliche Angaben – bezahlte oder gesponserte Inhalte werden immer als Werbung gekennzeichnet",
      "Du bist auf dem Treffpunkt-Discord, damit wir dich erreichen",
    ],
    sections: [
      {
        key: "promo.offer",
        title: "Dein Antrag",
        description: "Nur das Wichtigste – Details klären wir per Nachricht.",
        questions: [
          { key: "promo.name", label: "Wer steckt dahinter? (Name, Studio oder Firma)", type: "SHORT_TEXT", maxLength: 100 },
          { key: "promo.category", label: "Was soll vorgestellt werden?", type: "SELECT", options: ["Spiel", "App / Software", "Produkt", "Sonstiges"] },
          { key: "promo.link", label: "Link (Store-Seite oder Website)", type: "URL", placeholder: "https://…" },
          {
            key: "promo.pitch",
            label: "Worum geht es – und was stellst du dir vor?",
            type: "LONG_TEXT",
            minLength: 50,
            maxLength: 1500,
            placeholder: "z. B. Spiel im Stream anspielen, ein Short dazu, Keys verlosen – und wann (Release)?",
          },
          {
            key: "promo.compensation",
            label: "Was bietest du an?",
            type: "SELECT",
            options: ["Bezahlte Kooperation", "Kostenloser Key oder kostenloses Produkt", "Keys oder Preise für ein Giveaway", "Nichts – einfach eine Anfrage"],
          },
        ],
      },
    ],
  },
  templates: [
    {
      category: "EINGANG",
      title: "Werbung – Antrag angekommen",
      body: "Moin {name},\n\ndanke für deinen Werbe-Antrag ({bewerbungs_id})! Jannik schaut ihn sich in Ruhe an und meldet sich – {bearbeitungszeit}.",
    },
    {
      category: "RUECKFRAGE",
      title: "Werbung – Rückfrage",
      body: "Moin {name},\n\nzu deinem Werbe-Antrag haben wir noch eine Frage:\n\n{grund}\n\nAntworte einfach direkt hier im Portal.",
    },
    {
      category: "EINLADUNG",
      title: "Werbung – kurzer Austausch",
      body: "Moin {name},\n\ndein Antrag klingt spannend! Lass uns kurz auf Discord sprechen – schreib uns im Portal zwei, drei Zeiten, an denen du kannst.",
    },
    {
      category: "ERINNERUNG",
      title: "Werbung – Wir warten auf deine Antwort",
      body: "Moin {name},\n\nwir hatten dir zu deinem Werbe-Antrag {bewerbungs_id} eine Frage gestellt und noch nichts gehört. Melde dich gern in den nächsten Tagen – sonst schließen wir den Antrag.",
    },
    {
      category: "ANNAHME",
      title: "Werbung – Zusage",
      body: "Moin {name},\n\nJannik ist dabei! 📣 Danke für deinen Antrag.\n\n**So geht's weiter:**\n{grund}\n\nGut zu wissen: Bezahlte oder gesponserte Inhalte kennzeichnet Jannik immer als Werbung.",
    },
    {
      category: "ABLEHNUNG",
      title: "Werbung – Absage",
      body: "Moin {name},\n\ndanke für deinen Werbe-Antrag! Diesmal passt es leider nicht:\n\n{grund}\n\nDu kannst ab dem **{sperrfrist}** gern einen neuen Antrag stellen.",
    },
    {
      category: "SONSTIGES",
      title: "Werbung – Infos zu Werbung",
      body: "**Gut zu wissen:**\n- Jannik stellt nur vor, was zu ihm und der Community passt.\n- Bezahlte oder gesponserte Inhalte werden immer als Werbung gekennzeichnet.\n- Keine Werbung für Glücksspiel, Wetten, Krypto oder NSFW.\n- Termine und Konditionen besprechen wir per Nachricht.",
    },
  ],
};

/** Weitere Bewerbungsarten neben „Team“: Partner-Anfrage und Werbe-Antrag. */
export const KIND_SEEDS: KindSeed[] = [PARTNER_SEED, PROMO_SEED];

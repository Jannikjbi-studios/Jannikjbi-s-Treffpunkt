/**
 * Startinhalte für weitere Bewerbungsarten neben „Team“: Bewerbungsart,
 * eine „Stelle“ je Art (startet geschlossen – Admins öffnen sie, sobald Rolle
 * und Fragen passen), Abschnitte mit Fragen und passende Nachrichtenbausteine.
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

/** Weitere Bewerbungsarten neben „Team“ – derzeit die Partner-Anfrage. */
export const KIND_SEEDS: KindSeed[] = [PARTNER_SEED];

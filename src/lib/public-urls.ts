/**
 * Öffentliche Adressen, die auch im Browser gebraucht werden (ohne das Server-Env-Modul).
 * Standard: jannikjbi.de – andere Installationen setzen sie über NEXT_PUBLIC_*-Variablen.
 */
const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.jannikjbi.de";

/**
 * Regeln (Formular-Bestätigung, KI-Hinweise). Die Regeln stehen im Discord in #regeln –
 * Standard ist deshalb die Discord-Seite von jannikjbi.de. Besser: NEXT_PUBLIC_RULES_URL
 * auf den Link zum Kanal #regeln setzen (https://discord.com/channels/<Server-ID>/<Kanal-ID>).
 */
export const RULES_URL = process.env.NEXT_PUBLIC_RULES_URL || `${MAIN_SITE}/discord`;

/** Hostname einer URL (für erlaubte Links in KI-Antworten, Anzeige im Footer). */
export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

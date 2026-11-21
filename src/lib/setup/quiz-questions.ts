/**
 * Quiz pro Stelle: vier bis sechs Fragen mit genau einer richtigen Antwort – passend
 * zu den Aufgaben der Stelle (Grundsätze, keine Detailregeln des Servers). Lösungen
 * bleiben auf dem Server (Question.correctOption). Im Formularbaukasten frei änderbar –
 * gern um Fragen zu den eigenen Regeln aus #regeln ergänzen.
 */
import type { SeedQuestion, SeedSection } from "@/lib/setup/questions";

/** Einfacher, fester Hash: richtige Antwort steht pro Frage an einer anderen Stelle (nicht immer zuerst). */
function slot(key: string, n: number) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % n;
}

export function quiz(key: string, label: string, correct: string, wrong: string[]): SeedQuestion {
  const options = [...wrong];
  options.splice(slot(key, wrong.length + 1), 0, correct);
  return { key, label, type: "QUIZ", options, correctOption: correct };
}

const section = (slug: string, questions: SeedQuestion[], title = "Regel-Quiz"): SeedSection => ({
  key: `${slug}.quiz`,
  title,
  description: "Pro Frage ist genau eine Antwort richtig. Das Team sieht nur, wie viele du richtig hast.",
  questions,
});

/** Fragen, die für alle Stellen mit Kontakt zur Community passen. */
const fairness = (slug: string) =>
  quiz(`${slug}.quiz_friends`, "Ein Freund bittet dich, eine Regel für ihn „mal kurz zu ignorieren“.", "Ablehnen – Regeln gelten für alle gleich", [
    "Für Freunde ist das in Ordnung",
    "Machen, solange es niemand merkt",
    "Erst die Leitung fragen und es dann trotzdem tun",
  ]);
const internal = (slug: string) =>
  quiz(`${slug}.quiz_internal`, "Wo besprichst du interne Team-Themen?", "Nur in den internen Team-Kanälen", [
    "Im öffentlichen Chat, damit alle Bescheid wissen",
    "In privaten Gruppen mit Zuschauern",
    "Im Stream-Chat",
  ]);

export const POSITION_QUIZ: Record<string, SeedSection> = {
  cutter: section(
    "cutter",
    [
      quiz("cutter.quiz_length", "Wie lang darf ein YouTube Short höchstens sein?", "3 Minuten", ["30 Sekunden", "10 Minuten", "Es gibt keine Grenze"]),
      quiz("cutter.quiz_format", "Welches Format brauchen Shorts und TikToks?", "Hochformat 9:16 (z. B. 1080 × 1920)", ["Querformat 16:9", "Quadratisch 1:1", "Egal, wird automatisch angepasst"]),
      quiz("cutter.quiz_hook", "Was ist in den ersten Sekunden eines Shorts am wichtigsten?", "Ein Hook – sofort zeigen, worum es geht", [
        "Ein langes Intro mit Logo",
        "Erst mal die Vorgeschichte erklären",
        "Ruhig anfangen, der Höhepunkt kommt am Ende",
      ]),
      quiz("cutter.quiz_music", "Darfst du beliebige Musik aus dem Radio unter ein Short legen?", "Nein – nur Musik, die man nutzen darf (z. B. aus der Bibliothek der Plattform)", [
        "Ja, bei kurzen Videos ist das immer erlaubt",
        "Ja, wenn man den Künstler nennt",
        "Ja, solange es unter 30 Sekunden bleibt",
      ]),
      quiz("cutter.quiz_privacy", "Im Clip ist eine private Nachricht mit Klarnamen zu sehen. Was tust du?", "Unkenntlich machen oder die Stelle rausschneiden", [
        "Nichts – war ja live im Stream",
        "Drinlassen, das bringt Klicks",
        "Nur den Nachnamen verpixeln",
      ]),
    ],
    "Kurz-Quiz",
  ),
  "social-media": section(
    "social-media",
    [
      quiz("social-media.quiz_hashtags", "Welche Hashtags sind am sinnvollsten?", "Wenige passende, z. B. zum Spiel und zum Thema", [
        "Möglichst viele, egal ob sie passen",
        "Nur #fyp und #viral",
        "Gar keine – das bringt nichts",
      ]),
      quiz("social-media.quiz_title", "Was macht einen guten Short-Titel aus?", "Kurz, neugierig machend und ehrlich zum Inhalt", [
        "Möglichst lang mit allen Details",
        "Reißerisch, auch wenn es im Video nicht passiert",
        "Nur Emojis",
      ]),
      quiz("social-media.quiz_hate", "Wie gehst du mit beleidigenden Kommentaren um?", "Ausblenden oder löschen und bei Bedarf melden – nicht mitstreiten", [
        "Öffentlich zurückbeleidigen",
        "Ignorieren, auch wenn es eskaliert",
        "Den Kommentar anpinnen",
      ]),
      quiz("social-media.quiz_login", "Jemand fragt dich nach den Zugangsdaten zu einem Kanal von Jannik.", "Nie weitergeben – auch nicht an Teammitglieder", [
        "Weitergeben, wenn die Person im Team ist",
        "Weitergeben, wenn sie nett fragt",
        "In den Team-Chat posten, dann haben es alle",
      ]),
    ],
    "Kurz-Quiz",
  ),
  "stream-mod": section("stream-mod", [
    quiz("stream-mod.quiz_metagaming", "Was ist im Stream-Chat bei GTA RP „Metagaming“?", "Infos aus dem Stream ins Spiel tragen, z. B. anderen verraten, wo jemand ist", [
      "Über das Spiel diskutieren",
      "Den Streamer etwas zum Spiel fragen",
      "Emotes spammen",
    ]),
    quiz("stream-mod.quiz_timeout", "Jemand spammt zum ersten Mal Großbuchstaben. Was passt am besten?", "Kurz hinweisen oder ein kurzer Timeout", [
      "Sofort dauerhaft bannen",
      "Gar nichts tun",
      "Den Streamer bitten, den Stream zu beenden",
    ]),
    quiz("stream-mod.quiz_hate", "Jemand schreibt rassistische Beleidigungen in den Chat.", "Sofort entfernen und bannen – kein Hinweis nötig", [
      "Erst einmal verwarnen",
      "Ignorieren, sonst wird es schlimmer",
      "Öffentlich darüber diskutieren",
    ]),
    quiz("stream-mod.quiz_streamer", "Wie sprichst du Jannik während des Streams auf ein Problem an?", "Kurz und ruhig, ohne den Stream zu stören – oder erst danach im Team", [
      "Mit vielen Nachrichten hintereinander im Chat",
      "Gar nicht, Mods regeln alles allein",
      "Per lautem Voice-Call mitten im Stream",
    ]),
    quiz("stream-mod.quiz_personal", "Jemand postet die Wohnadresse einer anderen Person im Chat.", "Nachricht sofort löschen, Person bannen und dem Team melden", [
      "Nachfragen, ob die Adresse stimmt",
      "Stehen lassen, es ist ja nur Text",
      "Nur den Streamer informieren",
    ]),
    fairness("stream-mod"),
  ]),
  moderator: section("moderator", [
    quiz("moderator.quiz_report", "Ein Mitglied meldet eine Beleidigung. Was machst du zuerst?", "Beweise sichern (Screenshot/Nachrichtenlink) und beide Seiten anhören", [
      "Sofort den Gemeldeten bannen",
      "Den Report ignorieren, wenn du die Person kennst",
      "Öffentlich im Chat nachfragen, was los war",
    ]),
    quiz("moderator.quiz_warn", "Wozu dient ein Warn?", "Eine dokumentierte Verwarnung, damit sich Verhalten ändert und es nachvollziehbar bleibt", [
      "Als Strafe ohne Begründung",
      "Damit man Leute schneller bannen kann",
      "Nur als Spaß unter Teammitgliedern",
    ]),
    quiz("moderator.quiz_doxxing", "Jemand teilt private Daten (z. B. Adresse, Telefonnummer) einer anderen Person.", "Sofort löschen, Person sanktionieren und an die Leitung melden", [
      "Erst einmal stehen lassen und beobachten",
      "Nur verwarnen, wenn die Daten falsch sind",
      "Die Person bitten, es selbst zu löschen",
    ]),
    quiz("moderator.quiz_power", "Ein Mitglied kritisiert deine Entscheidung im öffentlichen Chat.", "Ruhig bleiben und das Gespräch in ein Ticket oder eine DM verlagern", [
      "Die Person dafür timeouten",
      "Öffentlich zurückschießen",
      "Die Entscheidung sofort zurücknehmen",
    ]),
    fairness("moderator"),
    internal("moderator"),
  ]),
  supporter: section("supporter", [
    quiz("supporter.quiz_unknown_ticket", "Ein Ticket, das du nicht selbst lösen kannst – was tust du?", "Ehrlich sagen und an die zuständige Stelle weitergeben", [
      "Das Ticket schließen, damit die Liste leer ist",
      "Irgendeine Antwort geben, damit Ruhe ist",
      "Die Person vertrösten, ohne es weiterzugeben",
    ]),
    quiz("supporter.quiz_insult", "Jemand beleidigt dich im Ticket. Wie reagierst du zuerst?", "Ruhig bleiben, auf den Ton hinweisen und sachlich weiterhelfen", [
      "Im gleichen Ton zurückschreiben",
      "Die Person sofort dauerhaft bannen",
      "Das Ticket unbeantwortet liegen lassen",
    ]),
    quiz("supporter.quiz_close", "Wann schließt du ein Ticket?", "Wenn das Anliegen geklärt ist oder die Person sich trotz Nachfrage nicht mehr meldet", [
      "Sobald du einmal geantwortet hast",
      "Nach fünf Minuten ohne Antwort",
      "Nie – Tickets bleiben offen",
    ]),
    quiz("supporter.quiz_password", "Jemand schickt dir im Ticket sein Passwort, damit du „schneller helfen“ kannst.", "Darauf hinweisen, dass er es nie teilen soll, und es ändern lassen", [
      "Nutzen, um das Problem selbst zu lösen",
      "Im Team-Chat weitergeben",
      "Ignorieren und weitermachen",
    ]),
    fairness("supporter"),
    internal("supporter"),
  ]),
  designer: section(
    "designer",
    [
      quiz("designer.quiz_thumbnail", "Was macht ein gutes YouTube-Thumbnail aus?", "Wenig Text, klares Motiv und starke Kontraste – auch klein lesbar", [
        "Möglichst viel Text, damit alles erklärt ist",
        "Viele kleine Details",
        "Ein Screenshot ohne Bearbeitung",
      ]),
      quiz("designer.quiz_emote", "Worauf musst du bei Twitch-Emotes achten?", "Sie müssen auch ganz klein (28 px) noch erkennbar sein", [
        "Sie sollten möglichst viele Details haben",
        "Text funktioniert in Emotes am besten",
        "Die Größe ist egal",
      ]),
      quiz("designer.quiz_assets", "Darfst du beliebige Bilder aus der Google-Suche verwenden?", "Nein – nur eigene oder freie bzw. lizenzierte Bilder", [
        "Ja, wenn man sie leicht verändert",
        "Ja, für Thumbnails immer",
        "Ja, wenn das Bild klein ist",
      ]),
      quiz("designer.quiz_files", "In welchem Format gibst du ein Overlay mit Transparenz ab?", "PNG oder WebM mit Alphakanal", ["JPG", "GIF ohne Transparenz", "PDF"]),
    ],
    "Kurz-Quiz",
  ),
  "event-team": section(
    "event-team",
    [
      quiz("event-team.quiz_giveaway", "Wie bleibt ein Giveaway fair?", "Klare Teilnahmebedingungen vorher und zufällige, nachvollziehbare Auslosung", [
        "Freunde bevorzugen",
        "Bedingungen erst nach der Auslosung festlegen",
        "Wer am lautesten fragt, gewinnt",
      ]),
      quiz("event-team.quiz_announce", "Wann kündigst du ein Event an?", "Rechtzeitig vorher, mit Datum, Uhrzeit und Ablauf", [
        "Fünf Minuten vorher",
        "Gar nicht, das spricht sich rum",
        "Erst wenn genug Leute fragen",
      ]),
      fairness("event-team"),
      internal("event-team"),
    ],
    "Kurz-Quiz",
  ),
  "partner-manager": section(
    "partner-manager",
    [
      quiz("partner-manager.quiz_check", "Was prüfst du vor einer Partnerschaft zuerst?", "Ob der Partner zu Werten und Zielgruppe des Treffpunkts passt", [
        "Nur die Mitgliederzahl",
        "Ob er schnell antwortet",
        "Gar nichts – jeder Partner ist gut",
      ]),
      quiz("partner-manager.quiz_promise", "Darfst du einem Partner eigenmächtig Werbung im Stream zusagen?", "Nein – das entscheidet Jannik bzw. die Leitung", [
        "Ja, wenn der Partner groß ist",
        "Ja, wenn er dafür bezahlt",
        "Ja, das gehört zur Stelle",
      ]),
      quiz("partner-manager.quiz_label", "Wie wird bezahlte Werbung oder ein Affiliate-Link gekennzeichnet?", "Deutlich als Werbung/Anzeige", ["Gar nicht", "Nur im Kleingedruckten", "Erst auf Nachfrage"]),
      internal("partner-manager"),
    ],
    "Kurz-Quiz",
  ),
};

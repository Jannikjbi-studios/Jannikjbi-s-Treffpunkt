/**
 * „Welche Stelle passt zu mir?“ – kurzer Selbsttest vor dem Bewerben.
 * Jede Antwort gibt Punkte für passende Stellen (per Slug). Rein, nichts wird gespeichert.
 */
export interface MatchQuestion {
  key: string;
  label: string;
  options: { label: string; points: Record<string, number> }[];
}

export const MATCH_QUESTIONS: MatchQuestion[] = [
  {
    key: "ort",
    label: "Wo bist du am liebsten unterwegs?",
    options: [
      { label: "Im Discord – Tickets, Fragen, Leuten helfen", points: { supporter: 3, moderator: 1 } },
      { label: "Im Stream-Chat – live dabei, wenn Jannik streamt", points: { "stream-mod": 3, moderator: 1 } },
      { label: "Hinter den Kulissen – schneiden, posten, gestalten", points: { cutter: 2, "social-media": 2, designer: 2 } },
      { label: "Mitten in der Community – Events und Leute zusammenbringen", points: { "event-team": 3, "partner-manager": 1 } },
    ],
  },
  {
    key: "staerke",
    label: "Was liegt dir am meisten?",
    options: [
      { label: "Ruhig erklären, auch zum dritten Mal", points: { supporter: 3, "stream-mod": 1 } },
      { label: "Fair durchgreifen, wenn es nötig ist", points: { moderator: 3, "stream-mod": 2 } },
      { label: "Die besten Momente finden und schneiden", points: { cutter: 3 } },
      { label: "Titel, Hashtags und was gerade auf TikTok läuft", points: { "social-media": 3 } },
      { label: "Grafik – Thumbnails, Emotes, Overlays", points: { designer: 3 } },
      { label: "Organisieren und mit anderen absprechen", points: { "event-team": 2, "partner-manager": 2 } },
    ],
  },
  {
    key: "technik",
    label: "Welche Programme kannst du schon?",
    options: [
      { label: "Videoschnitt (z. B. CapCut, Premiere, DaVinci Resolve)", points: { cutter: 3, "social-media": 1 } },
      { label: "Grafik (z. B. Photoshop, Canva, Figma)", points: { designer: 3, "social-media": 1 } },
      { label: "Discord-Bots und Mod-Tools (z. B. Timeouts, Logs, Tickets)", points: { moderator: 2, supporter: 2, "stream-mod": 1 } },
      { label: "Nichts davon – ich bin eher für Menschen da", points: { supporter: 2, "stream-mod": 1, "event-team": 1, "partner-manager": 1 } },
    ],
  },
  {
    key: "zeit",
    label: "Wann hast du Zeit?",
    options: [
      { label: "Abends ab 17:30, wenn Jannik live ist", points: { "stream-mod": 3, moderator: 1 } },
      { label: "Unregelmäßig – ich teile mir die Arbeit selbst ein", points: { cutter: 2, "social-media": 2, designer: 2 } },
      { label: "Fast jeden Tag ein bisschen", points: { supporter: 2, moderator: 2, "social-media": 1 } },
    ],
  },
  {
    key: "stress",
    label: "Jemand ist im Chat richtig sauer. Du …",
    options: [
      { label: "… hörst zu und suchst eine Lösung", points: { supporter: 2, "partner-manager": 1 } },
      { label: "… klärst die Situation nach den Regeln", points: { moderator: 2, "stream-mod": 2 } },
      { label: "… holst lieber jemanden dazu, das ist nicht so meins", points: { cutter: 1, "social-media": 1, designer: 1 } },
    ],
  },
];

/** Stellen, die der Test kennt – alle anderen (neu angelegt) bekommen einen neutralen Punkt und erscheinen hinten. */
const KNOWN = new Set(MATCH_QUESTIONS.flatMap((q) => q.options.flatMap((o) => Object.keys(o.points))));

/** Punkte je Slug; Reihenfolge absteigend, nur Stellen mit Punkten. */
export function scorePositions(answers: Record<string, number>, slugs: string[]): { slug: string; points: number }[] {
  const score = new Map<string, number>(slugs.map((s) => [s, KNOWN.has(s) ? 0 : 1]));
  for (const q of MATCH_QUESTIONS) {
    const opt = q.options[answers[q.key]];
    if (!opt) continue;
    for (const [slug, p] of Object.entries(opt.points)) if (score.has(slug)) score.set(slug, score.get(slug)! + p);
  }
  return [...score.entries()]
    .map(([slug, points]) => ({ slug, points }))
    .filter((x) => x.points > 0)
    .sort((a, b) => b.points - a.points);
}

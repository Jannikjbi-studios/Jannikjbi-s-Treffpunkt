import { describe, expect, it } from "vitest";
import { buildJobsMessage, buildSpotlightMessage, type JobPosition } from "@/lib/messages/jobs";
import { accentInt, bannerTitle } from "@/lib/messages/position-accent";
import { COMPONENTS_V2, V2_TEXT_LIMIT, v2Text } from "@/lib/messages/embed";
import { POSITIONS } from "@/lib/setup/seed-data";

const positions: JobPosition[] = POSITIONS.map((p) => ({
  slug: p.slug,
  title: p.title,
  tagline: p.tagline,
  description: p.description,
  icon: p.icon,
  status: p.status as JobPosition["status"],
  tasks: p.tasks,
  requirements: p.requirements,
  minAge: null,
  acceptRoleId: null,
}));
const opts = { appUrl: "https://portal.jannikjbi.de", defaultMinAge: 16, updatedAt: new Date("2026-11-11T12:00:00Z") };
const buttons = (m: ReturnType<typeof buildJobsMessage>) =>
  JSON.parse(JSON.stringify(m.components)).flatMap(function walk(c: { type: number; components?: unknown[] }): unknown[] {
    return c.type === 2 ? [c] : (c.components ?? []).flatMap((x) => walk(x as { type: number; components?: unknown[] }));
  }) as { label: string; url: string }[];

describe("Stellenaufruf", () => {
  const m = buildJobsMessage(positions, opts);
  const t = v2Text(m);

  it("Components V2, ohne Pings, unter dem Textlimit", () => {
    expect(m.flags).toBe(COMPONENTS_V2);
    expect(m.allowed_mentions).toEqual({ parse: [] });
    expect(t.length).toBeLessThanOrEqual(V2_TEXT_LIMIT);
    expect(t).toContain("## Wir suchen neue Teammitglieder!");
  });

  it("nur offene Stellen – geschlossene tauchen gar nicht auf", () => {
    expect(t).toContain(POSITIONS.find((p) => p.slug === "supporter")!.description);
    expect(t).not.toContain(POSITIONS.find((p) => p.slug === "event-team")!.description);
    expect(t).not.toContain("Event-Team");
    expect(t).not.toContain("Designer");
    expect(t).not.toContain("Geschlossen");
    expect(t).toMatch(/Supporter: 🟢 Offen/);
    expect(t).toContain("Mindestens 16 Jahre alt");
  });

  it("versteckte Stellen tauchen nicht auf", () => {
    const hidden = buildJobsMessage(positions.map((p) => (p.slug === "social-media" ? { ...p, status: "HIDDEN" as const } : p)), opts);
    expect(v2Text(hidden)).not.toContain(POSITIONS.find((p) => p.slug === "social-media")!.description);
    expect(v2Text(hidden)).not.toMatch(/Social-Media: 🟢 Offen/);
  });

  it("Knöpfe: Portal + je offene Stelle, max. 5 pro Reihe, nur https", () => {
    const b = buttons(m);
    const open = positions.filter((p) => p.status === "OPEN").length;
    expect(b).toHaveLength(open + 1);
    expect(b[0].url).toBe("https://portal.jannikjbi.de");
    expect(b.slice(1).every((x) => x.url.startsWith("https://portal.jannikjbi.de/positionen/"))).toBe(true);
    const rows = JSON.parse(JSON.stringify(m.components))[0].components.filter((c: { type: number }) => c.type === 1);
    expect(rows.every((r: { components: unknown[] }) => r.components.length <= 5)).toBe(true);
    expect(buttons(buildJobsMessage(positions, { ...opts, appUrl: "http://localhost:3000" }))).toHaveLength(0);
  });

  it("Rolle wird erwähnt, wenn hinterlegt (ohne Ping)", () => {
    const withRole = buildJobsMessage(positions.map((p) => (p.slug === "supporter" ? { ...p, acceptRoleId: "123456789012345678" } : p)), opts);
    expect(v2Text(withRole)).toContain("<@&123456789012345678>");
  });

  it("abweichendes Mindestalter je Stelle → niedrigstes mit Hinweis", () => {
    const mixed = buildJobsMessage(positions.map((p) => (p.slug === "cutter" ? { ...p, minAge: 15 } : p)), opts);
    expect(v2Text(mixed)).toContain("Mindestens 15 Jahre alt (je nach Stelle)");
  });

  it("keine offenen Stellen → freundlicher Hinweis", () => {
    const none = buildJobsMessage(positions.map((p) => ({ ...p, status: "CLOSED" as const })), opts);
    expect(v2Text(none)).toContain("alle Stellen besetzt");
  });
});

describe("Einzelaufruf pro Stelle", () => {
  const support = positions.find((p) => p.slug === "supporter")!;

  it("ein Block: Titel, Aufgaben + Voraussetzungen als Zitat, Interesse, Fußzeile", () => {
    const m = buildSpotlightMessage(support, opts);
    const t = v2Text(m);
    expect(m.flags).toBe(COMPONENTS_V2);
    expect(t).toContain("## Wir suchen **Supporter**!");
    expect(t).toContain("🔧 **Das solltest du mitbringen:**");
    for (const r of support.requirements) expect(t).toContain(`> ${r}`);
    expect(t).toContain("📩 **Interesse?**");
    expect(t).toContain("Jannikjbi's Treffpunkt");
    // oben das Banner der Stelle, dann genau ein großer Textblock vor Knöpfen/Fußzeile
    const kids = JSON.parse(JSON.stringify(m.components))[0].components as { type: number }[];
    expect(kids[0].type).toBe(12);
    expect(kids[1].type).toBe(10);
    expect(kids.filter((k) => k.type === 10)).toHaveLength(2); // Inhalt + Fußzeile
  });

  it("Banner und Akzentfarbe passend zur Stelle", () => {
    const m = buildSpotlightMessage(support, opts);
    const box = JSON.parse(JSON.stringify(m.components))[0] as { accent_color: number; components: { type: number; items?: { media: { url: string } }[] }[] };
    const url = box.components[0].items![0].media.url;
    expect(url).toMatch(/^https:\/\/portal\.jannikjbi\.de\/api\/banner\/supporter\?v=[a-z0-9]+$/);
    expect(box.accent_color).toBe(accentInt(support.icon));
    // anderer Titel → neue Bild-URL (Discord merkt sich Bilder)
    const renamed = JSON.parse(JSON.stringify(buildSpotlightMessage({ ...support, title: "Support-Team" }, opts).components))[0].components[0].items[0].media.url;
    expect(renamed).not.toBe(url);
    // ohne https keine Bild-URL (Discord könnte sie nicht laden)
    const local = JSON.parse(JSON.stringify(buildSpotlightMessage(support, { ...opts, appUrl: "http://localhost:3000" }).components))[0].components as { type: number }[];
    expect(local.some((k) => k.type === 12)).toBe(false);
  });

  it("Knopf direkt zur Bewerbung, Rolle als Erwähnung", () => {
    const m = buildSpotlightMessage({ ...support, acceptRoleId: "123456789012345678" }, opts);
    expect(v2Text(m)).toContain("## Wir suchen <@&123456789012345678>!");
    expect(buttons(m)[0].url).toBe("https://portal.jannikjbi.de/positionen/supporter");
  });

  it("geschlossene Stelle: kein Bewerbungs-Knopf, Hinweis statt Aufruf", () => {
    const m = buildSpotlightMessage({ ...support, status: "CLOSED" }, opts);
    expect(buttons(m)).toHaveLength(0);
    expect(v2Text(m)).toContain("gerade geschlossen");
  });
});

describe("Gesamtaufruf als ein Block", () => {
  it("nur ein Inhalts-Textblock (wie ein Embed)", () => {
    const kids = JSON.parse(JSON.stringify(buildJobsMessage(positions, opts).components))[0].components as { type: number }[];
    expect(kids.filter((k) => k.type === 10)).toHaveLength(2); // Inhalt + Fußzeile
  });
});

describe("Banner-Titel", () => {
  it("Teil vor dem Bindestrich farbig", () => {
    expect(bannerTitle("Stream-Mod")).toEqual({ lead: "STREAM-", rest: "MOD" });
    expect(bannerTitle("Cutter")).toEqual({ lead: "", rest: "CUTTER" });
  });
});

describe("Einzelaufruf für einen Antrag", () => {
  const antrag = {
    slug: "sponsoring",
    title: "Sponsoring-Anfrage",
    tagline: "Spiel, App oder Produkt? Frag an, ob Jannik es vorstellt.",
    description: "Jannik schaut sich jeden Antrag persönlich an.",
    icon: "megaphone",
    status: "OPEN" as const,
    tasks: ["Kurzes Formular ausfüllen"],
    requirements: ["Kein Glücksspiel"],
    minAge: null,
    acceptRoleId: null,
    type: { key: "promo" },
  };
  it("kein „Wir suchen“, eigener Knopf und Link unter /antraege", () => {
    const m = buildSpotlightMessage(antrag, opts);
    const t = v2Text(m);
    expect(t).toContain("## 📣 Sponsoring-Anfrage");
    expect(t).not.toContain("Wir suchen");
    expect(t).not.toContain("Das solltest du mitbringen");
    expect(t).toContain("📌 **Gut zu wissen:**");
    expect(buttons(m)[0]).toMatchObject({ label: "Antrag stellen", url: "https://portal.jannikjbi.de/antraege/sponsoring" });
  });
  it("Partner-Anfrage: Knopf führt zu /partner", () => {
    const m = buildSpotlightMessage({ ...antrag, slug: "partner-anfrage", title: "Partner-Anfrage", icon: "handshake", type: { key: "partner" } }, opts);
    expect(buttons(m)[0]).toMatchObject({ label: "Anfrage stellen", url: "https://portal.jannikjbi.de/partner" });
  });
});

import { describe, expect, it } from "vitest";
import { KINDS, KIND_KEYS, KIND_POSITION_SLUG, kindOf, positionHref } from "@/lib/kinds";
import { confirmationsFor, confirmationsSchemaFor } from "@/lib/applications/form";
import { allowedTeamTargets, canTeamTransition, statusHintFor, timelineFor } from "@/lib/applications/status";
import { buildLogMessage } from "@/lib/messages/embed";
import { buildSpotlightMessage } from "@/lib/messages/jobs";
import { KIND_SEEDS } from "@/lib/setup/kinds-seed";
import { TEAM_ONLY_TEMPLATE_TITLES, TEMPLATES } from "@/lib/setup/seed-data";

describe("Bewerbungsarten", () => {
  it("unbekannte Art → Team", () => {
    expect(kindOf(undefined).key).toBe("team");
    expect(kindOf("gibtsnicht").key).toBe("team");
    expect(kindOf("whitelist").key).toBe("team");
  });
  it("Bestätigungen (nur Team)", () => {
    expect(confirmationsFor("team").map((c) => c.key)).toEqual(["voice", "rules", "unpaid", "truth", "privacy"]);
    expect(confirmationsFor("team").find((c) => c.key === "unpaid")!.label).toContain("Treffpunkt");
    const team = confirmationsSchemaFor("team");
    expect(team.safeParse({ voice: true, rules: true, unpaid: true, truth: true, privacy: true }).success).toBe(true);
    expect(team.safeParse({ voice: true, rules: true, truth: true, privacy: true }).success).toBe(false);
  });
  it("Art ohne Gespräch (falls ergänzt)", () => {
    expect(allowedTeamTargets("SUBMITTED", { interview: false })).not.toContain("INTERVIEW");
    expect(allowedTeamTargets("SUBMITTED")).toContain("INTERVIEW");
    expect(canTeamTransition("IN_REVIEW", "INTERVIEW", { interview: false })).toBe(false);
    expect(canTeamTransition("IN_REVIEW", "ACCEPTED", { interview: false })).toBe(true);
    // Altfall: steht schon im Gespräch → darf weiter
    expect(canTeamTransition("INTERVIEW", "ACCEPTED", { interview: false })).toBe(true);
    expect(timelineFor(false)).toEqual(["SUBMITTED", "IN_REVIEW", "ACCEPTED"]);
    expect(timelineFor(true)).toContain("INTERVIEW");
  });
  it("Hinweis nach Annahme", () => {
    expect(statusHintFor("ACCEPTED", KINDS.team)).toContain("Team");
  });
  it("Bewerbungs-Post: Art ohne Gespräch ohne „Zum Gespräch“", () => {
    const base = { positionTitle: "Test", applicantDiscordId: "1", applicantName: "A", publicId: "JT-1", age: 20, teamUrl: "https://x/y", flags: [], claimCustomId: "nv:claim:abcdefghij12" };
    expect(JSON.stringify(buildLogMessage({ ...base, interview: false }))).not.toContain("nv:status:INTERVIEW");
    expect(JSON.stringify(buildLogMessage(base))).toContain("nv:status:INTERVIEW");
  });
  it("Einzelaufruf: Team-Stelle", () => {
    const p = { slug: "cutter", title: "Cutter", tagline: "t", description: "d", icon: "scissors", status: "OPEN" as const, tasks: ["a"], requirements: [], minAge: 15, acceptRoleId: null, type: { key: "team" } };
    const json = JSON.stringify(buildSpotlightMessage(p, { appUrl: "https://portal.example", defaultMinAge: 16 }));
    expect(json).toContain("Wir suchen **Cutter**! ✂️");
    expect(json).toContain("Deine Aufgaben");
    expect(json).toContain("Jetzt als Cutter bewerben");
  });
  it("Startinhalte: eindeutige Keys, Quiz mit Lösung", () => {
    const keys = KIND_SEEDS.flatMap((k) => k.position.sections.flatMap((s) => [s.key, ...s.questions.map((q) => q.key)]));
    expect(new Set(keys).size).toBe(keys.length);
    for (const q of KIND_SEEDS.flatMap((k) => k.position.sections.flatMap((s) => s.questions)).filter((q) => q.type === "QUIZ")) {
      expect(q.options).toContain(q.correctOption);
    }
  });
  it("Bausteine: jede Art hat in jeder Kategorie mindestens einen", () => {
    const categories = ["EINGANG", "RUECKFRAGE", "EINLADUNG", "ANNAHME", "ABLEHNUNG", "ERINNERUNG", "SONSTIGES"];
    const all = [
      ...TEMPLATES.map((t) => ({ category: t.category, title: t.title, kinds: TEAM_ONLY_TEMPLATE_TITLES.includes(t.title) ? ["team"] : [] })),
      ...KIND_SEEDS.flatMap((k) => k.templates.map((t) => ({ category: t.category, title: t.title, kinds: [k.type.key] }))),
    ];
    for (const kind of KIND_KEYS) {
      for (const c of categories) {
        const own = all.filter((t) => t.category === c && t.kinds.includes(kind));
        expect(own.length, `${kind} / ${c}`).toBeGreaterThan(0);
      }
    }
    const titles = all.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("Partner-Anfrage", () => {
  it("eigene Art ohne Gespräch und ohne Team-Funktionen", () => {
    const k = kindOf("partner");
    expect(k.key).toBe("partner");
    expect(k.interview).toBe(false);
    expect(k.teamFeatures).toBe(false);
    expect(confirmationsFor("partner").map((c) => c.key)).toEqual(["truth", "privacy"]);
  });
  it("Startinhalte: geschlossen, eigene Fragen mit Slug-Präfix", () => {
    const p = KIND_SEEDS.find((k) => k.type.key === "partner")!.position;
    expect(p.status).toBe("CLOSED");
    for (const s of p.sections) for (const q of s.questions) expect(q.key.startsWith("partner.")).toBe(true);
  });
});

describe("Anträge (Sponsoring-Anfrage)", () => {
  it("eigene Art ohne Gespräch und ohne Team-Funktionen, Anträge unter /antraege", () => {
    const k = kindOf("promo");
    expect(k.key).toBe("promo");
    expect(k.interview).toBe(false);
    expect(k.teamFeatures).toBe(false);
    expect(k.path).toBe("/antraege");
    expect(positionHref("sponsoring", "promo")).toBe("/antraege/sponsoring");
    expect(positionHref("cutter", "team")).toBe("/positionen/cutter");
    expect(KIND_POSITION_SLUG.promo).toBeUndefined(); // mehrere Anträge möglich, Link änderbar
    expect(confirmationsFor("promo").map((c) => c.key)).toEqual(["truth", "privacy"]);
  });
  it("Startinhalte: offen, nur für die Leitung sichtbar, eigene Fragen mit Slug-Präfix", () => {
    const p = KIND_SEEDS.find((k) => k.type.key === "promo")!.position;
    expect(p.status).toBe("OPEN");
    expect(p.slug).toBe("sponsoring");
    expect(p.title).toBe("Sponsoring-Anfrage");
    expect(p.teamRoleIds?.length).toBeGreaterThan(0);
    for (const s of p.sections) for (const q of s.questions) expect(q.key.startsWith("promo.")).toBe(true);
  });
});

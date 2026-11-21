import { describe, expect, it } from "vitest";
import { blockedRoleIds, hasBlockedRole } from "@/lib/applications/blocked-roles";
import { evaluateRoles, roleIdList } from "@/lib/auth/access";
import { acceptRoles, revertRoles } from "@/lib/discord/roles";
import { isTeamBanRoleName } from "@/lib/team/ban-role";
import { POSITIONS } from "@/lib/setup/seed-data";
import { KEY_PATTERN } from "@/lib/applications/similarity";

const A = "111111111111111111";
const B = "222222222222222222";
const C = "333333333333333333";

describe("Gesperrt fürs Bewerben (Blacklist, Team-Sperre)", () => {
  it("liest Rollen-IDs mit Komma, Leerzeichen oder Semikolon", () => {
    expect(blockedRoleIds(`${A}, ${B};${A} kaputt`)).toEqual([A, B]);
    expect(blockedRoleIds("")).toEqual([]);
    expect(blockedRoleIds(undefined)).toEqual([]);
  });
  it("sperrt nur mit passender Rolle", () => {
    expect(hasBlockedRole([C, B], [A, B])).toBe(true);
    expect(hasBlockedRole([C], [A, B])).toBe(false);
    expect(hasBlockedRole([], [A])).toBe(false);
    expect(hasBlockedRole([A], [])).toBe(false);
  });
  it("erkennt die Rolle „Team-Sperre“ am Namen", () => {
    expect(isTeamBanRoleName("🚷 Team-Sperre")).toBe(true);
    expect(isTeamBanRoleName("teamsperre")).toBe(true);
    expect(isTeamBanRoleName("⛔ Blacklist")).toBe(false);
    expect(isTeamBanRoleName("Team")).toBe(false);
  });
});

describe("Team- und Admin-Rolle: eine oder mehrere IDs", () => {
  it("roleIdList", () => {
    expect(roleIdList(`${A},${B}`)).toEqual([A, B]);
    expect(roleIdList(undefined)).toEqual([]);
  });
  it("Team mit einer von mehreren Rollen, Admin nur zusätzlich mit Admin-Rolle", () => {
    expect(evaluateRoles([B], { teamRoleId: `${A}, ${B}`, adminRoleId: C })).toEqual({ isTeam: true, isAdmin: false });
    expect(evaluateRoles([B, C], { teamRoleId: `${A}, ${B}`, adminRoleId: C })).toEqual({ isTeam: true, isAdmin: true });
    expect(evaluateRoles([C], { teamRoleId: A, adminRoleId: C })).toEqual({ isTeam: false, isAdmin: false });
  });
});

describe("Rolle nach der Probezeit (Test-Mod → Moderator)", () => {
  it("Zurücknehmen entfernt auch die Rolle nach der Probezeit", () => {
    expect(acceptRoles({ acceptRoleId: A }, "")).toEqual([A]);
    expect(revertRoles({ acceptRoleId: A, passRoleId: B }, C)).toEqual([A, C, B]);
    expect(revertRoles({ acceptRoleId: A, passRoleId: null }, "")).toEqual([A]);
    expect(revertRoles({ acceptRoleId: A, passRoleId: A }, "")).toEqual([A]);
  });
});

describe("Stellen von Jannikjbi's Treffpunkt", () => {
  const bySlug = Object.fromEntries(POSITIONS.map((p) => [p.slug, p]));
  it("offen: Cutter, Social-Media, Stream-Mod, Moderator, Supporter – geschlossen: Designer, Event-Team, Partner-Manager", () => {
    expect(POSITIONS.filter((p) => p.status === "OPEN").map((p) => p.slug)).toEqual(["cutter", "social-media", "stream-mod", "moderator", "supporter"]);
    expect(POSITIONS.filter((p) => p.status === "CLOSED").map((p) => p.slug)).toEqual(["designer", "event-team", "partner-manager"]);
  });
  it("Plätze und Mindestalter wie geplant", () => {
    expect(bySlug["stream-mod"].seats).toBe(2);
    expect(bySlug.moderator.seats).toBe(1);
    expect(bySlug.supporter.seats).toBe(1);
    expect(bySlug.cutter.minAge).toBe(15);
    expect(bySlug["social-media"].minAge).toBe(15);
    expect(bySlug.moderator.minAge).toBeUndefined();
  });
  it("Moderator und Supporter starten mit Test-Rolle", () => {
    expect(bySlug.moderator.roles).toEqual({ accept: "🗡️ Test-Mod", afterProbation: "⚔️ Moderator" });
    expect(bySlug.supporter.roles).toEqual({ accept: "🧪 Test-Supporter", afterProbation: "🎧 Supporter" });
  });
  it("Keys mit Bindestrich-Slug sind gültig", () => {
    expect("stream-mod.tools").toMatch(KEY_PATTERN);
    expect("social-media.platforms").toMatch(KEY_PATTERN);
    expect("cutter.software").toMatch(KEY_PATTERN);
    expect("a.b.c").not.toMatch(KEY_PATTERN);
  });
});

import { isOwner, isOwnerSetting, ownerRoleIds } from "@/lib/auth/owner";

describe("Owner-Stufe über Admin (Owner, Co-Owner)", () => {
  const OWNER = "444444444444444444";
  const ctx = (isAdmin: boolean, roles: string[]) => ({ access: { isAdmin, roleIds: roles }, user: { roleIds: [] as string[] } });
  it("nur Admins mit Owner-Rolle", () => {
    expect(isOwner(ctx(true, [OWNER]), [OWNER])).toBe(true);
    expect(isOwner(ctx(true, [A]), [OWNER])).toBe(false);
    expect(isOwner(ctx(false, [OWNER]), [OWNER])).toBe(false);
  });
  it("ohne OWNER_ROLE_ID gilt jeder Admin als Owner", () => {
    expect(isOwner(ctx(true, []), [])).toBe(true);
    expect(ownerRoleIds("")).toEqual([]);
  });
  it("fällt auf gespeicherte Rollen zurück", () => {
    expect(isOwner({ access: { isAdmin: true }, user: { roleIds: [OWNER] } }, [OWNER])).toBe(true);
  });
  it("KI-Einstellungen sind Owner-Sache", () => {
    expect(isOwnerSetting("ai.monthlyBudget")).toBe(true);
    expect(isOwnerSetting("applications.minAge")).toBe(false);
  });
});

import { rolesChanged } from "@/lib/auth/owner";

describe("Owner: Rollen und Rechte", () => {
  const base = { acceptRoleId: A, passRoleId: null, extraRoleIds: [B], nickPrefix: null };
  it("erkennt geänderte Rollen einer Stelle", () => {
    expect(rolesChanged(base, { ...base })).toBe(false);
    expect(rolesChanged(base, { ...base, extraRoleIds: [B] })).toBe(false);
    expect(rolesChanged(base, { ...base, acceptRoleId: C })).toBe(true);
    expect(rolesChanged(base, { ...base, extraRoleIds: [B, C] })).toBe(true);
    expect(rolesChanged(base, { ...base, nickPrefix: "[Mod]" })).toBe(true);
    expect(rolesChanged(null, { acceptRoleId: null, passRoleId: null, extraRoleIds: [], nickPrefix: null })).toBe(false);
    expect(rolesChanged(null, { ...base })).toBe(true);
  });
  it("Rollen-Einstellungen sind Owner-Sache", () => {
    for (const k of ["discord.acceptExtraRoleIds", "discord.autoRoleOnAccept", "discord.revertOnUnaccept", "team.juniorRoleIds"]) expect(isOwnerSetting(k), k).toBe(true);
    expect(isOwnerSetting("discord.claimButton")).toBe(false);
  });
});

import { guildWaitUntil, memberRoleIds, missingMemberRole } from "@/lib/applications/blocked-roles";
import { confirmationsFor, confirmationsSchemaFor } from "@/lib/applications/form";

describe("Voraussetzungen zum Bewerben", () => {
  it("Verifiziert-Rolle (👤 User) nur Pflicht, wenn eingetragen", () => {
    expect(memberRoleIds(`${A}`)).toEqual([A]);
    expect(missingMemberRole([B], [A])).toBe(true);
    expect(missingMemberRole([A, B], [A])).toBe(false);
    expect(missingMemberRole([], [])).toBe(false);
  });
  it("Mindestzeit auf dem Server", () => {
    const now = new Date("2026-11-21T12:00:00Z");
    const joined = new Date("2026-11-18T12:00:00Z");
    expect(guildWaitUntil(joined, 7, now)?.toISOString()).toBe("2026-11-25T12:00:00.000Z");
    expect(guildWaitUntil(joined, 3, now)).toBeNull();
    expect(guildWaitUntil(joined, 0, now)).toBeNull();
    expect(guildWaitUntil(null, 7, now)).toBeNull();
  });
  it("unter 16 zusätzlich das Okay der Eltern", () => {
    expect(confirmationsFor("team", { age: 15 }).map((c) => c.key)).toContain("parents");
    expect(confirmationsFor("team", { age: 16 }).map((c) => c.key)).not.toContain("parents");
    const all = { voice: true, rules: true, unpaid: true, truth: true, privacy: true };
    expect(confirmationsSchemaFor("team", { age: 15 }).safeParse(all).success).toBe(false);
    expect(confirmationsSchemaFor("team", { age: 15 }).safeParse({ ...all, parents: true }).success).toBe(true);
    expect(confirmationsSchemaFor("team", { age: 17 }).safeParse(all).success).toBe(true);
  });
});

import { STREAM_DAYS, coverageByDay } from "@/lib/team/stream-coverage";

describe("Stream-Abdeckung", () => {
  it("Streamtage kommen aus dem Streamplan", () => {
    expect(STREAM_DAYS).toEqual(["Montag", "Dienstag", "Freitag", "Samstag"]);
  });
  it("zählt angenommene Mods und offene Bewerbungen je Tag", () => {
    const c = coverageByDay([
      { name: "Mia", days: ["Montag", "Freitag"], accepted: true },
      { name: "Ben", days: ["Montag"], accepted: false },
    ]);
    expect(c.find((d) => d.day === "Montag")).toEqual({ day: "Montag", mods: ["Mia"], pending: 1 });
    expect(c.find((d) => d.day === "Dienstag")).toEqual({ day: "Dienstag", mods: [], pending: 0 });
  });
});

import { parseStreams } from "@/lib/twitch";

describe("Live-Anzeige (Twitch)", () => {
  it("live nur bei laufendem Stream", () => {
    expect(parseStreams({ data: [] })).toEqual({ live: false });
    expect(parseStreams(null)).toEqual({ live: false });
    expect(parseStreams({ data: [{ type: "live", title: "Taxi auf NRW", game_name: "Grand Theft Auto V", viewer_count: 12 }] })).toEqual({ live: true, title: "Taxi auf NRW", game: "Grand Theft Auto V", viewers: 12 });
  });
});

import { DEFAULT_CONTENT_ROLE_IDS, canUseContent, clipInputSchema, contentRoleIds, statusAfterPlatforms } from "@/lib/content/clips";
import { classifyRoute } from "@/lib/auth/routes";

describe("Content-Board", () => {
  const none = { tiktokAt: null, youtubeAt: null, instagramAt: null };
  const d = new Date();
  it("Team oder Content-Rolle", () => {
    expect(canUseContent({ isTeam: true, roleIds: [] }, [A])).toBe(true);
    expect(canUseContent({ isTeam: false, roleIds: [A] }, [A])).toBe(true);
    expect(canUseContent({ isTeam: false, roleIds: [B] }, [A])).toBe(false);
    expect(contentRoleIds("")).toEqual(DEFAULT_CONTENT_ROLE_IDS);
    expect(contentRoleIds(`${A},${B}`)).toEqual([A, B]);
  });
  it("alle Plattformen abgehakt → hochgeladen, Haken weg → wieder bereit", () => {
    expect(statusAfterPlatforms("READY", { ...none, tiktokAt: d })).toBe("READY");
    expect(statusAfterPlatforms("READY", { tiktokAt: d, youtubeAt: d, instagramAt: d })).toBe("POSTED");
    expect(statusAfterPlatforms("POSTED", { ...none, tiktokAt: d })).toBe("READY");
    expect(statusAfterPlatforms("NEEDS_CHANGES", none)).toBe("NEEDS_CHANGES");
  });
  it("nur https-Links", () => {
    const ok = clipInputSchema.safeParse({ title: "Crash", url: "https://drive.google.com/x", streamDate: "2026-11-20", note: "" });
    expect(ok.success && ok.data.streamDate?.toISOString()).toBe("2026-11-20T12:00:00.000Z");
    expect(ok.success && ok.data.note).toBeNull();
    expect(clipInputSchema.safeParse({ title: "Crash", url: "http://drive.google.com/x" }).success).toBe(false);
    expect(clipInputSchema.safeParse({ title: "Crash", url: "javascript:alert(1)" }).success).toBe(false);
    expect(clipInputSchema.safeParse({ title: "Crash", url: "https://x.de", streamDate: "" }).success).toBe(true);
  });
  it("/content braucht ein Login", () => {
    expect(classifyRoute("/content")).toBe("user-page");
  });
});

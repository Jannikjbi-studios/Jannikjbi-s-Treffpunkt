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

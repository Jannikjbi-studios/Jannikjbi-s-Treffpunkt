/**
 * Discord-Rolle „🚷 Team-Sperre“ passend zur Sperre im Portal:
 *  - Sperre im Portal → der Bot gibt die Rolle
 *  - Sperre läuft ab oder wird aufgehoben → der Bot nimmt sie wieder weg
 *    (beim Aufheben sofort, nach Ablauf mit den Tagesaufgaben oder spätestens,
 *    wenn die Person das nächste Mal das Formular öffnet)
 * „⛔ Blacklist“ vergibt das Team von Hand – solange jemand sie hat, geht kein Bewerben.
 *
 * Welche Rolle „Team-Sperre“ ist: DISCORD_TEAM_BAN_ROLE_ID (optional), sonst sucht der
 * Bot auf dem Server die Rolle mit „Team-Sperre“ im Namen – bevorzugt unter den IDs aus
 * DISCORD_BLOCKED_ROLE_IDS.
 */
import type { PrismaClient } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";
import { isTestDiscordId } from "@/lib/discord/test-ids";

const ID = /^\d{15,25}$/;
const CACHE_MS = 10 * 60_000;
let cached: { at: number; id: string | null } | null = null;

/** Rollenname wie „🚷 Team-Sperre“ oder „teamsperre“ erkennen. */
export const isTeamBanRoleName = (name: string) => name.toLowerCase().replace(/[^a-zäöü]/g, "").includes("teamsperre");

/** ID der Rolle „Team-Sperre“ (null = nicht eingerichtet bzw. nicht gefunden). */
export async function teamBanRoleId(): Promise<string | null> {
  const fromEnv = (process.env.DISCORD_TEAM_BAN_ROLE_ID ?? "").trim();
  if (ID.test(fromEnv)) return fromEnv;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId || !process.env.DISCORD_BOT_TOKEN) return null;
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.id;
  try {
    const { getDiscordApi } = await import("@/lib/discord/client");
    const api = getDiscordApi();
    const roles = api.listRoles ? await api.listRoles(guildId) : [];
    // Bevorzugt unter den Sperr-Rollen aus DISCORD_BLOCKED_ROLE_IDS (dort stehen Blacklist und Team-Sperre)
    const { blockedRoleIds } = await import("@/lib/applications/blocked-roles");
    const blocked = blockedRoleIds();
    const named = roles.filter((r) => isTeamBanRoleName(r.name));
    const id = (named.find((r) => blocked.includes(r.id)) ?? named[0])?.id ?? null;
    cached = { at: Date.now(), id };
    return id;
  } catch {
    return null;
  }
}

const activeWhere = (now: Date) => ({ liftedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] });

async function enqueueRole(mode: "add" | "remove", discordId: string, roleId: string, reason: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId || isTestDiscordId(discordId)) return null;
  const { enqueue, runOutbox } = await import("@/lib/discord/outbox-db");
  const job = await enqueue({ type: mode === "add" ? "ADD_ROLE" : "REMOVE_ROLE", guildId, discordUserId: discordId, roleId, reason });
  await runOutbox({ ids: [job.id] }).catch(() => {});
  return job.id;
}

/** Nach einer neuen Sperre: Rolle „Team-Sperre“ geben. */
export async function giveTeamBanRole(banId: string, db: PrismaClient = defaultDb) {
  const ban = await db.userBan.findUnique({ where: { id: banId }, include: { subject: { select: { discordId: true } } } });
  if (!ban) return null;
  const roleId = await teamBanRoleId();
  if (!roleId) return null;
  const job = await enqueueRole("add", ban.subject.discordId, roleId, `Sperre im Bewerbungsportal${ban.expiresAt ? " (befristet)" : ""}`);
  if (job) await db.userBan.update({ where: { id: ban.id }, data: { roleAddedAt: new Date(), roleRemovedAt: null } });
  return job;
}

/**
 * Rolle wieder entfernen, wenn die Person keine aktive Sperre mehr hat
 * (abgelaufen oder aufgehoben). Gibt true zurück, wenn gerade entfernt wurde.
 */
export async function releaseTeamBanRole(subjectId: string, now = new Date(), db: PrismaClient = defaultDb): Promise<boolean> {
  const pending = await db.userBan.findMany({ where: { subjectId, roleAddedAt: { not: null }, roleRemovedAt: null }, select: { id: true } });
  if (!pending.length) return false;
  if (await db.userBan.count({ where: { subjectId, ...activeWhere(now) } })) return false; // noch gesperrt
  const roleId = await teamBanRoleId();
  const user = await db.user.findUnique({ where: { id: subjectId }, select: { discordId: true } });
  if (roleId && user) await enqueueRole("remove", user.discordId, roleId, "Sperre im Bewerbungsportal abgelaufen oder aufgehoben");
  await db.userBan.updateMany({ where: { id: { in: pending.map((b) => b.id) } }, data: { roleRemovedAt: now } });
  return true;
}

/** Tagesaufgabe: Rolle bei allen abgelaufenen bzw. aufgehobenen Sperren entfernen. */
export async function releaseExpiredTeamBanRoles(db: PrismaClient = defaultDb, now = new Date()) {
  const done = await db.userBan.findMany({
    where: { roleAddedAt: { not: null }, roleRemovedAt: null, OR: [{ liftedAt: { not: null } }, { expiresAt: { lte: now } }] },
    select: { subjectId: true },
    take: 200,
  });
  let n = 0;
  for (const subjectId of new Set(done.map((b) => b.subjectId))) if (await releaseTeamBanRole(subjectId, now, db)) n++;
  return n;
}

/**
 * Darf die Person wegen ihrer Discord-Rollen nicht bewerben?
 *  - Blacklist (oder eine andere Rolle aus DISCORD_BLOCKED_ROLE_IDS) → gesperrt
 *  - nur Team-Sperre, die aus einer inzwischen abgelaufenen Portal-Sperre stammt →
 *    Rolle jetzt entfernen und durchlassen
 */
export async function blockedByRoles(user: { id: string; roleIds: string[] }, roleIds: readonly string[] | undefined, now = new Date()): Promise<boolean> {
  const { blockedRoleIds } = await import("@/lib/applications/blocked-roles");
  const roles = roleIds ?? user.roleIds;
  if (!roles.length) return false;
  const teamBan = await teamBanRoleId();
  const blocked = new Set([...blockedRoleIds(), ...(teamBan ? [teamBan] : [])]);
  const hits = roles.filter((r) => blocked.has(r));
  if (!hits.length) return false;
  if (hits.some((r) => r !== teamBan)) return true; // Blacklist o. Ä.
  return !(await releaseTeamBanRole(user.id, now));
}

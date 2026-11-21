/**
 * Rollen & Server-Name bei Annahme bzw. wenn eine Annahme zurückgenommen wird.
 * Alles läuft über die Outbox (wiederholt bei Fehlern, sichtbar in der Bewerbung).
 */
import type { Prisma } from "@prisma/client";
import { enqueue } from "@/lib/discord/outbox-db";

/** Rollen-IDs aus „123, 456 789“ (ohne Dubletten, nur gültige Snowflakes). */
export function parseRoleIds(text: string): string[] {
  return [...new Set(text.split(/[\s,]+/).filter((x) => /^\d{15,25}$/.test(x)))].slice(0, 10);
}

/** Alle Rollen, die bei Annahme vergeben werden (Rolle der Stelle + „Dazu“-Rollen der Stelle + allgemeine zusätzliche). */
export function acceptRoles(position: { acceptRoleId: string | null; extraRoleIds?: string[] | null }, extra: string): string[] {
  return [...new Set([position.acceptRoleId, ...(position.extraRoleIds ?? []), ...parseRoleIds(extra)].filter((x): x is string => !!x && /^\d{15,25}$/.test(x)))];
}

/** Beim Zurücknehmen: alle Rollen der Stelle entfernen – auch die nach der Probezeit (z. B. Moderator). */
export function revertRoles(position: { acceptRoleId: string | null; passRoleId?: string | null; extraRoleIds?: string[] | null }, extra: string): string[] {
  const roles = acceptRoles(position, extra);
  const pass = position.passRoleId;
  return pass && /^\d{15,25}$/.test(pass) && !roles.includes(pass) ? [...roles, pass] : roles;
}

/**
 * Probezeit bestanden: Rolle nach der Probezeit geben (z. B. Moderator) und die
 * Annahme-Rolle (z. B. Test-Mod) entfernen. Ohne passRoleId passiert nichts.
 */
export async function enqueueProbationPass(
  tx: Prisma.TransactionClient,
  opts: { guildId: string; discordUserId: string; position: { acceptRoleId: string | null; passRoleId: string | null }; applicationId: string; publicId: string | null },
): Promise<string[]> {
  const pass = opts.position.passRoleId;
  if (!pass || !/^\d{15,25}$/.test(pass)) return [];
  const reason = `Bewerbung ${opts.publicId ?? ""} – Probezeit bestanden`.trim();
  const ids = [(await enqueue({ type: "ADD_ROLE", guildId: opts.guildId, discordUserId: opts.discordUserId, roleId: pass, reason }, { tx, applicationId: opts.applicationId })).id];
  const test = opts.position.acceptRoleId;
  if (test && test !== pass && /^\d{15,25}$/.test(test)) {
    ids.push((await enqueue({ type: "REMOVE_ROLE", guildId: opts.guildId, discordUserId: opts.discordUserId, roleId: test, reason }, { tx, applicationId: opts.applicationId })).id);
  }
  return ids;
}

/** Platzhalter der Willkommensnachricht. */
export function welcomeText(template: string, vars: { discordId: string; name: string; position: string }) {
  return template.replaceAll("{mention}", `<@${vars.discordId}>`).replaceAll("{name}", vars.name).replaceAll("{stelle}", vars.position);
}

export async function enqueueMemberChanges(
  tx: Prisma.TransactionClient,
  opts: { mode: "accept" | "revert"; guildId: string; discordUserId: string; roles: string[]; nickPrefix: string | null; fallbackName: string; applicationId: string; publicId: string | null },
): Promise<string[]> {
  const ids: string[] = [];
  const reason = `Bewerbung ${opts.publicId ?? ""} ${opts.mode === "accept" ? "angenommen" : "Annahme zurückgenommen"}`.trim();
  for (const roleId of opts.roles) {
    const job = await enqueue(
      { type: opts.mode === "accept" ? "ADD_ROLE" : "REMOVE_ROLE", guildId: opts.guildId, discordUserId: opts.discordUserId, roleId, reason },
      { tx, applicationId: opts.applicationId },
    );
    ids.push(job.id);
  }
  if (opts.nickPrefix?.trim()) {
    const job = await enqueue(
      { type: "SET_NICK", guildId: opts.guildId, discordUserId: opts.discordUserId, prefix: opts.nickPrefix.trim(), mode: opts.mode === "accept" ? "add" : "remove", fallbackName: opts.fallbackName, reason },
      { tx, applicationId: opts.applicationId },
    );
    ids.push(job.id);
  }
  return ids;
}

/**
 * Gesperrt fürs Bewerben: Wer auf Discord eine dieser Rollen hat (⛔ Blacklist,
 * 🚷 Team-Sperre), kann keine Bewerbung starten oder absenden.
 * Rollen-IDs kommen aus DISCORD_BLOCKED_ROLE_IDS (Vercel), durch Komma getrennt.
 * Rein (ohne Server-Abhängigkeiten) und damit testbar.
 */
export const BLOCKED_ROLE_MESSAGE =
  "Mit deiner aktuellen Rolle auf dem Discord (Blacklist oder Team-Sperre) kannst du dich gerade nicht bewerben.";

/** Gültige Rollen-IDs aus „123, 456 789“ (ohne Dubletten). */
export function blockedRoleIds(raw: string | undefined = process.env.DISCORD_BLOCKED_ROLE_IDS): string[] {
  return [...new Set((raw ?? "").split(/[\s,;]+/).filter((x) => /^\d{15,25}$/.test(x)))];
}

/** Hat die Person (laut ihren Discord-Rollen) eine Sperr-Rolle? */
export function hasBlockedRole(roleIds: readonly string[] | null | undefined, blocked: readonly string[] = blockedRoleIds()): boolean {
  if (!roleIds?.length || !blocked.length) return false;
  return blocked.some((r) => roleIds.includes(r));
}

// ─── Voraussetzungen auf dem Discord ──────────────────────────

export const MEMBER_ROLE_MESSAGE =
  "Du bist auf dem Discord noch nicht verifiziert. Lies dir #regeln durch und klick dort auf den Knopf – danach kannst du dich bewerben.";

/** Rolle(n), die man zum Bewerben braucht (z. B. 👤 User nach der Verifizierung) – aus DISCORD_MEMBER_ROLE_ID. */
export function memberRoleIds(raw: string | undefined = process.env.DISCORD_MEMBER_ROLE_ID): string[] {
  return blockedRoleIds(raw);
}

/** Fehlt die Rolle „verifiziert“? (Ohne Angabe in Vercel gibt es keine Pflicht.) */
export function missingMemberRole(roleIds: readonly string[] | null | undefined, required: readonly string[] = memberRoleIds()): boolean {
  if (!required.length) return false;
  return !required.some((r) => (roleIds ?? []).includes(r));
}

const DAY = 86_400_000;

/**
 * Mindestzeit auf dem Server: ab wann darf jemand absenden? null = jetzt schon
 * (Regel aus, Beitrittsdatum unbekannt oder Zeit erreicht).
 */
export function guildWaitUntil(joinedAt: Date | null | undefined, minDays: number, now = new Date()): Date | null {
  if (!minDays || !joinedAt) return null;
  const until = new Date(joinedAt.getTime() + minDays * DAY);
  return until > now ? until : null;
}

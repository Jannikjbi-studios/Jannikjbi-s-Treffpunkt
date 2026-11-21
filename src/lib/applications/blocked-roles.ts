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

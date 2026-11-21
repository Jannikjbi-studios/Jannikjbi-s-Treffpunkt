/**
 * Owner-Stufe über Admin (Owner, Co-Owner): darf zusätzlich das, was Daten oder
 * Kosten betrifft – alle Bewerbungen zurücksetzen, Einstellungen aus einer Sicherung
 * einspielen, den Datenexport aller Bewerbungen, Bewerbungen endgültig löschen und
 * die KI-Einstellungen (Budget, Modelle) ändern.
 *
 * Rollen-IDs aus OWNER_ROLE_ID (mehrere mit Komma). Ohne Angabe gilt jeder Admin als Owner.
 * Rein (ohne Server-Abhängigkeiten), damit testbar.
 */
import { roleIdList } from "@/lib/auth/access";

export const OWNER_ONLY = "Das dürfen nur Owner und Co-Owner.";

export const ownerRoleIds = (raw: string | undefined = process.env.OWNER_ROLE_ID) => roleIdList(raw);

export function isOwner(
  ctx: { access: { isAdmin: boolean; roleIds?: string[] | null }; user: { roleIds: string[] } },
  owners: string[] = ownerRoleIds(),
): boolean {
  if (!ctx.access.isAdmin) return false;
  if (!owners.length) return true;
  const roles = ctx.access.roleIds?.length ? ctx.access.roleIds : ctx.user.roleIds;
  return owners.some((r) => roles.includes(r));
}

/** Einstellungen, die Kosten verursachen (KI) – nur Owner. */
export const isOwnerSetting = (key: string) => key.startsWith("ai.");

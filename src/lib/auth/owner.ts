/**
 * Owner-Stufe über Admin (Owner, Co-Owner): darf zusätzlich alles, was Rollen,
 * Rechte, Daten oder Kosten betrifft:
 *  - Daten: alle Bewerbungen zurücksetzen, Sicherung einspielen, Datenexport aller
 *    Bewerbungen, Bewerbungen endgültig löschen, Stellen löschen
 *  - Rollen & Rechte: Discord-Rollen an Stellen ändern, Rollen-Einstellungen
 *    (Zusatzrollen, Junior-Rollen, Rollen-Automatik), Rollen-Abgleich „Beheben“
 *  - Sperren: unbefristet sperren und Sperren aufheben
 *  - Bot: Knopf „Übernehmen“ einrichten, Befehle registrieren, Changelog-Posts löschen
 *  - Kosten: KI-Einstellungen (Budget, Modelle)
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

/** Rollen-Einstellungen – nur Owner (wer hier etwas einträgt, verteilt Discord-Rollen). */
const OWNER_SETTING_KEYS = ["discord.acceptExtraRoleIds", "discord.autoRoleOnAccept", "discord.revertOnUnaccept", "team.juniorRoleIds"];

/** Einstellungen, die Kosten (KI) oder Rollen betreffen – nur Owner. */
export const isOwnerSetting = (key: string) => key.startsWith("ai.") || OWNER_SETTING_KEYS.includes(key);

/** Hat sich an den Discord-Rollen einer Stelle etwas geändert? */
export function rolesChanged(
  before: { acceptRoleId: string | null; passRoleId: string | null; extraRoleIds: string[]; nickPrefix: string | null } | null,
  after: { acceptRoleId: string | null; passRoleId: string | null; extraRoleIds: string[]; nickPrefix: string | null },
): boolean {
  const b = before ?? { acceptRoleId: null, passRoleId: null, extraRoleIds: [], nickPrefix: null };
  return (
    (b.acceptRoleId ?? null) !== (after.acceptRoleId ?? null) ||
    (b.passRoleId ?? null) !== (after.passRoleId ?? null) ||
    [...b.extraRoleIds].sort().join() !== [...after.extraRoleIds].sort().join() ||
    (b.nickPrefix ?? null) !== (after.nickPrefix ?? null)
  );
}

import "server-only";
import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/lib/auth/session";
import { canUseContent } from "@/lib/content/clips";

/** Darf die eingeloggte Person ins Content-Board? (Team oder Content-Rolle) */
export async function getContentAccess() {
  const { user, access } = await getCurrentAccess();
  if (!user) return { user: null, allowed: false, isTeam: false } as const;
  const isTeam = !!access?.isTeam;
  const roleIds = access?.roleIds?.length ? access.roleIds : user.roleIds;
  return { user, allowed: canUseContent({ isTeam, roleIds }), isTeam } as const;
}

/** Für Server Actions: eingeloggt und mit Content-Rolle, sonst Login bzw. Hinweisseite. */
export async function requireContent() {
  const c = await getContentAccess();
  if (!c.user) redirect("/login?callbackUrl=/content");
  if (!c.allowed) redirect("/content");
  return { user: c.user, isTeam: c.isTeam };
}

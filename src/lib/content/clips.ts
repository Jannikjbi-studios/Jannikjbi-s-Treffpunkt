/**
 * Content-Board: Cutter reichen fertige Shorts ein, Social-Media lädt sie hoch
 * und hakt die Plattformen ab. Rein (ohne Server-Abhängigkeiten), damit testbar
 * und auch im Browser nutzbar.
 *
 * Wer darf rein: das Team (TEAM_ROLE_ID) und alle mit einer Content-Rolle
 * (DISCORD_CONTENT_ROLE_ID, mehrere mit Komma). Ohne Angabe: 🎬 Content-Team,
 * ✂️ Cutter, 📱 Social-Media und 🎨 Designer.
 */
import { z } from "zod";
import type { ClipStatus } from "@prisma/client";
import { roleIdList } from "@/lib/auth/access";

/** 🎬 Content-Team, ✂️ Cutter, 📱 Social-Media, 🎨 Designer */
export const DEFAULT_CONTENT_ROLE_IDS = ["1573541476103888926", "1573541468466057418", "1573541467748569168", "1573541470059634748"];

export function contentRoleIds(raw: string | undefined = process.env.DISCORD_CONTENT_ROLE_ID): string[] {
  const ids = roleIdList(raw);
  return ids.length ? ids : DEFAULT_CONTENT_ROLE_IDS;
}

export function canUseContent(who: { isTeam: boolean; roleIds: readonly string[] }, ids: string[] = contentRoleIds()): boolean {
  return who.isTeam || who.roleIds.some((r) => ids.includes(r));
}

export const CLIP_PLATFORMS = [
  { key: "tiktok", field: "tiktokAt", label: "TikTok" },
  { key: "youtube", field: "youtubeAt", label: "YouTube Shorts" },
  { key: "instagram", field: "instagramAt", label: "Instagram Reels" },
] as const;

export type ClipPlatform = (typeof CLIP_PLATFORMS)[number]["key"];
export type ClipPlatformField = (typeof CLIP_PLATFORMS)[number]["field"];
export const CLIP_PLATFORM_KEYS = CLIP_PLATFORMS.map((p) => p.key) as [ClipPlatform, ...ClipPlatform[]];

export const CLIP_STATUS_LABEL: Record<ClipStatus, string> = {
  READY: "Bereit zum Hochladen",
  NEEDS_CHANGES: "Braucht Änderungen",
  POSTED: "Hochgeladen",
};

type PlatformState = Record<ClipPlatformField, Date | null>;

/** Status nach dem Abhaken: alle Plattformen erledigt → „Hochgeladen“, Haken weg → wieder „Bereit“. */
export function statusAfterPlatforms(status: ClipStatus, clip: PlatformState): ClipStatus {
  const all = CLIP_PLATFORMS.every((p) => clip[p.field]);
  if (all) return "POSTED";
  return status === "POSTED" ? "READY" : status;
}

const httpsUrl = z
  .string()
  .trim()
  .max(500, "Der Link ist zu lang.")
  .refine((v) => {
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "Bitte einen Link mit https:// (z. B. Google Drive, Dropbox, Streamable).");

export const clipInputSchema = z.object({
  title: z.string().trim().min(3, "Mindestens 3 Zeichen.").max(100, "Höchstens 100 Zeichen."),
  url: httpsUrl,
  streamDate: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Datum als TT.MM.JJJJ")
    .optional()
    .transform((v) => (v ? new Date(`${v}T12:00:00Z`) : null)),
  note: z
    .string()
    .trim()
    .max(500, "Höchstens 500 Zeichen.")
    .optional()
    .transform((v) => v || null),
});

export type ClipInput = z.input<typeof clipInputSchema>;

export const clipResubmitSchema = z.object({
  url: httpsUrl,
  note: clipInputSchema.shape.note,
});

export const clipFeedbackSchema = z.string().trim().min(3, "Schreib kurz, was geändert werden soll.").max(500, "Höchstens 500 Zeichen.");

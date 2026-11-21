"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { publicEnv } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";
import { requireContent } from "@/lib/content/access";
import { enqueue, deliverNow } from "@/lib/discord/outbox-db";
import { esc } from "@/lib/discord/botlog";
import { buildApplicantMessage, buildBotLogMessage } from "@/lib/messages/embed";
import {
  CLIP_PLATFORMS,
  CLIP_PLATFORM_KEYS,
  clipFeedbackSchema,
  clipInputSchema,
  clipResubmitSchema,
  statusAfterPlatforms,
  type ClipInput,
  type ClipPlatform,
} from "@/lib/content/clips";
import type { ActionResult } from "@/app/actions/application";

const idSchema = z.string().min(10).max(40);
const boardUrl = (id: string) => `${publicEnv.appUrl}/content#${id}`;

function fieldErrors(e: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

/** Cutter: fertiges Short einreichen. */
export async function submitClipAction(input: ClipInput): Promise<ActionResult> {
  const { user } = await requireContent();
  const p = clipInputSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Bitte die markierten Felder prüfen.", fieldErrors: fieldErrors(p.error) };
  if (!(await rateLimit(`clip:${user.id}`, 20, 3600)).ok) return { ok: false, error: "Das waren viele auf einmal – bitte später noch mal." };

  const clip = await db.contentClip.create({ data: { ...p.data, createdById: user.id } });
  const channelId = (await getSettings())["discord.contentChannelId"];
  if (channelId) {
    const job = await enqueue({
      type: "CHANNEL_MESSAGE",
      kind: "content",
      channelId,
      message: buildBotLogMessage(`✂️ **Neues Short bereit:** „${esc(clip.title)}“ von ${esc(user.globalName || user.username)}`, {
        url: boardUrl(clip.id),
        linkLabel: "Zum Content-Board",
      }),
    });
    await deliverNow([job.id]);
  }
  refresh();
  return { ok: true };
}

/** Social-Media: Plattform abhaken (oder Haken wieder weg). */
export async function setClipPlatformAction(id: string, platform: ClipPlatform, done: boolean): Promise<ActionResult> {
  const { user } = await requireContent();
  if (!idSchema.safeParse(id).success || !CLIP_PLATFORM_KEYS.includes(platform)) return { ok: false, error: "Ungültig." };
  const clip = await db.contentClip.findUnique({ where: { id } });
  if (!clip) return { ok: false, error: "Den Clip gibt es nicht mehr." };
  const field = CLIP_PLATFORMS.find((p) => p.key === platform)!.field;
  const next = { ...clip, [field]: done ? (clip[field] ?? new Date()) : null };
  await db.contentClip.update({
    where: { id },
    data: { [field]: next[field], status: statusAfterPlatforms(clip.status, next), handledById: user.id },
  });
  refresh();
  return { ok: true };
}

/** Social-Media: als hochgeladen markieren (auch wenn nicht überall gepostet wird). */
export async function markClipPostedAction(id: string): Promise<ActionResult> {
  const { user } = await requireContent();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Ungültig." };
  await db.contentClip.updateMany({ where: { id }, data: { status: "POSTED", handledById: user.id } });
  refresh();
  return { ok: true };
}

/** Social-Media: mit Feedback zurück an den Cutter (DM). */
export async function sendBackClipAction(id: string, feedback: string): Promise<ActionResult> {
  const { user } = await requireContent();
  const f = clipFeedbackSchema.safeParse(feedback);
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Ungültig." };
  if (!f.success) return { ok: false, error: f.error.issues[0]?.message ?? "Ungültig." };
  const clip = await db.contentClip.findUnique({ where: { id }, include: { createdBy: { select: { discordId: true, globalName: true, username: true } } } });
  if (!clip) return { ok: false, error: "Den Clip gibt es nicht mehr." };
  await db.contentClip.update({ where: { id }, data: { status: "NEEDS_CHANGES", feedback: f.data, handledById: user.id } });
  if (clip.createdById !== user.id) {
    const job = await enqueue({
      type: "DM",
      discordUserId: clip.createdBy.discordId,
      purpose: "team_reminder",
      message: buildApplicantMessage({
        title: `Dein Short „${clip.title}“ braucht noch Änderungen`,
        body: `Moin ${clip.createdBy.globalName || clip.createdBy.username},\n\n${user.globalName || user.username} hat Feedback zu deinem Short:\n\n> ${f.data.replace(/\n/g, "\n> ")}\n\nLade die neue Version einfach im Content-Board hoch.`,
        statusUrl: boardUrl(clip.id),
        buttonLabel: "Zum Content-Board",
      }),
    });
    await deliverNow([job.id]);
  }
  refresh();
  return { ok: true };
}

/** Cutter: neue Version nach Feedback. */
export async function resubmitClipAction(id: string, input: { url: string; note?: string }): Promise<ActionResult> {
  const { user, isTeam } = await requireContent();
  const p = clipResubmitSchema.safeParse(input);
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Ungültig." };
  if (!p.success) return { ok: false, error: "Bitte die markierten Felder prüfen.", fieldErrors: fieldErrors(p.error) };
  const clip = await db.contentClip.findUnique({ where: { id }, select: { createdById: true } });
  if (!clip) return { ok: false, error: "Den Clip gibt es nicht mehr." };
  if (clip.createdById !== user.id && !isTeam) return { ok: false, error: "Nur wer den Clip eingereicht hat, kann eine neue Version hochladen." };
  await db.contentClip.update({ where: { id }, data: { url: p.data.url, note: p.data.note, status: "READY", feedback: null } });
  refresh();
  return { ok: true };
}

/** Löschen: eigener Clip (solange nicht hochgeladen) oder Team. */
export async function deleteClipAction(id: string): Promise<ActionResult> {
  const { user, isTeam } = await requireContent();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Ungültig." };
  const clip = await db.contentClip.findUnique({ where: { id }, select: { createdById: true, status: true } });
  if (!clip) return { ok: true };
  if (!isTeam && (clip.createdById !== user.id || clip.status === "POSTED")) return { ok: false, error: "Das darf nur das Team." };
  await db.contentClip.delete({ where: { id } });
  refresh();
  return { ok: true };
}

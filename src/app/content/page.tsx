import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { ContentClip } from "@prisma/client";
import { Container, Notice, PageHero, formatDay } from "@/components/ui";
import { ClipForm } from "@/components/content/ClipForm";
import { ClipCard, type ClipView } from "@/components/content/ClipCard";
import { getContentAccess } from "@/lib/content/access";
import { CLIP_PLATFORMS, type ClipPlatform } from "@/lib/content/clips";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Content-Board",
  description: "Shorts vom Cutter bis zum Upload – für das Content-Team vom Treffpunkt.",
  robots: { index: false },
};

export default function ContentPage() {
  return (
    <>
      <PageHero label="TREFFPUNKT // CONTENT" title="Content" emphasis="Board." compact>
        <p>Cutter reichen fertige Shorts ein, Social-Media lädt sie hoch und hakt die Plattformen ab. So geht kein Clip verloren.</p>
      </PageHero>
      <Container>
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<div className="nv-skeleton h-96" />}>
            <Board />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

type Row = ContentClip & { createdBy: { globalName: string | null; username: string }; handledBy: { globalName: string | null; username: string } | null };

const nameOf = (u: { globalName: string | null; username: string }) => u.globalName || u.username;

function toView(c: Row, userId: string): ClipView {
  return {
    id: c.id,
    title: c.title,
    url: c.url,
    note: c.note,
    feedback: c.feedback,
    status: c.status,
    streamDay: c.streamDate ? formatDay(c.streamDate) : null,
    createdDay: formatDay(c.createdAt),
    by: nameOf(c.createdBy),
    handledBy: c.handledBy ? nameOf(c.handledBy) : null,
    done: Object.fromEntries(CLIP_PLATFORMS.map((p) => [p.key, !!c[p.field]])) as Record<ClipPlatform, boolean>,
    mine: c.createdById === userId,
  };
}

async function Board() {
  const c = await getContentAccess();
  if (!c.user) {
    return (
      <div className="nv-card p-6 space-y-3">
        <p className="font-semibold">Kurz einloggen</p>
        <p className="text-sm text-fg-2">Das Content-Board ist fürs Content-Team. Log dich mit Discord ein.</p>
        <Link href="/login?callbackUrl=/content" className="nv-btn nv-btn-primary nv-btn-sm">Mit Discord einloggen</Link>
      </div>
    );
  }
  if (!c.allowed) {
    return (
      <Notice tone="warn" title="Nur fürs Content-Team">
        Das Board sehen 🎬 Content-Team, ✂️ Cutter, 📱 Social-Media, 🎨 Designer und das Team. Du hast die Rolle gerade bekommen? Dann log dich einmal neu ein.
      </Notice>
    );
  }

  const include = { createdBy: { select: { globalName: true, username: true } }, handledBy: { select: { globalName: true, username: true } } };
  const [open, posted] = await Promise.all([
    db.contentClip.findMany({ where: { status: { in: ["READY", "NEEDS_CHANGES"] } }, include, orderBy: { createdAt: "asc" }, take: 100 }),
    db.contentClip.findMany({ where: { status: "POSTED" }, include, orderBy: { updatedAt: "desc" }, take: 20 }),
  ]);
  const ready = open.filter((x) => x.status === "READY");
  const changes = open.filter((x) => x.status === "NEEDS_CHANGES");

  const list = (rows: Row[], empty: string) =>
    rows.length === 0 ? (
      <p className="text-sm text-muted">{empty}</p>
    ) : (
      <ul className="space-y-3">
        {rows.map((r) => (
          <ClipCard key={`${r.id}:${r.updatedAt.getTime()}`} clip={toView(r, c.user.id)} isTeam={c.isTeam} />
        ))}
      </ul>
    );

  return (
    <div className="space-y-10">
      <ClipForm />
      <section aria-labelledby="ready" className="space-y-3">
        <h2 id="ready" className="nv-mono">Bereit zum Hochladen ({ready.length})</h2>
        {list(ready, "Gerade wartet nichts – Zeit für neue Shorts.")}
      </section>
      <section aria-labelledby="changes" className="space-y-3">
        <h2 id="changes" className="nv-mono">Braucht Änderungen ({changes.length})</h2>
        {list(changes, "Nichts offen.")}
      </section>
      <section aria-labelledby="posted" className="space-y-3">
        <h2 id="posted" className="nv-mono">Zuletzt hochgeladen</h2>
        {list(posted, "Noch nichts hochgeladen.")}
        <p className="text-xs text-faint">Hochgeladene Clips werden nach 60 Tagen automatisch gelöscht, offene nach 120 Tagen.</p>
      </section>
    </div>
  );
}

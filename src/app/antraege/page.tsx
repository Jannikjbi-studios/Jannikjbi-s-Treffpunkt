import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Container, IconTile, PageHero } from "@/components/ui";
import { listRequestPositions } from "@/lib/data/positions";
import { positionHref } from "@/lib/kinds";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Anträge",
  description: "Du möchtest, dass Jannik dein Spiel, deine App oder dein Produkt vorstellt? Hier findest du alle Anträge.",
};

export default function RequestsPage() {
  return (
    <>
      <PageHero label="TREFFPUNKT // ANTRÄGE" title="Anträge" emphasis="an Jannik." compact>
        <p>Du möchtest, dass Jannik etwas für dich vorstellt? Such dir den passenden Antrag aus – Jannik schaut sich jeden persönlich an.</p>
      </PageHero>
      <Container>
        <Suspense fallback={<div className="nv-skeleton h-64" />}>
          <List />
        </Suspense>
      </Container>
    </>
  );
}

async function List() {
  await connection();
  const [requests, partner] = await Promise.all([
    listRequestPositions(),
    db.position.findFirst({ where: { slug: "partner-anfrage", status: { not: "HIDDEN" }, type: { key: "partner", active: true } }, select: { status: true, tagline: true } }),
  ]);
  return (
    <div className="space-y-10">
      {requests.length === 0 ? (
        <p className="text-muted">Gerade gibt es keine Anträge. Schau bald wieder vorbei.</p>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {requests.map((p, i) => {
            const open = p.status === "OPEN";
            return (
              <li key={p.id} className="nv-anim" style={{ "--i": i } as React.CSSProperties}>
                <Link href={positionHref(p.slug, "promo")} className="nv-card nv-card-hover group flex items-start gap-5 p-6 h-full">
                  <IconTile icon={p.icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl">{p.title}</h2>
                      <span className={`nv-pill !text-[0.7rem] !py-0.5 ${open ? "nv-tone-success" : ""}`}>{open ? "Offen" : "Gerade geschlossen"}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                    <p className="mt-4 text-sm text-fg-2 line-clamp-2">{p.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-text">
                      {open ? "Antrag ansehen" : "Mehr erfahren"}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {partner && (
        <p className="text-sm text-muted">
          Discord-Server, Creator oder Partnerschaft?{" "}
          <Link href="/partner" className="nv-link">
            Zur Partner-Anfrage
          </Link>
          {partner.status !== "OPEN" && " (gerade geschlossen)"}.
        </p>
      )}
    </div>
  );
}

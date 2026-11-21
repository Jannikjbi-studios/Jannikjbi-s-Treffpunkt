import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowRight,
  ArrowUpRight,
  ChatCircleDots,
  ClipboardText,
  DiscordLogo,
  FloppyDisk,
  Handshake,
  Microphone,
  ShieldCheck,
  TwitchLogo,
} from "@phosphor-icons/react/ssr";
import { Container, IconTile, PageHero, PositionIcon, SectionTitle, cn, formatDay } from "@/components/ui";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { LiveBadge } from "@/components/layout/LiveBadge";
import { deadlineLabel } from "@/lib/positions/deadline";
import { listPublicPositions, listRequestPositions, listUpcomingPositions } from "@/lib/data/positions";
import { positionHref } from "@/lib/kinds";
import { getSettings } from "@/lib/settings";
import { publicEnv } from "@/lib/env";
import { db } from "@/lib/db";
import { BRAND, SERVER_FEATURES, SOCIALS, STREAM_PLAN, STREAM_TIME, TWITCH_URL } from "@/lib/brand";

const STEPS = [
  { icon: DiscordLogo, title: "Mit Discord einloggen", text: "Kein extra Account. Wir brauchen nur deinen Discord-Namen." },
  { icon: FloppyDisk, title: "In Ruhe ausfüllen", text: "Dein Entwurf wird automatisch gespeichert. Du kannst jederzeit weitermachen." },
  { icon: ChatCircleDots, title: "Team prüft & meldet sich", text: "Du bekommst eine Bestätigung per DM und siehst den Stand im Dashboard." },
  { icon: Microphone, title: "Kurzes Gespräch", text: "Wir lernen uns im Sprachkanal auf Discord kennen. Ehrlich und ohne Druck." },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        label="Jannikjbi's Treffpunkt // Team"
        title="Mach mit im Team"
        emphasis="vom Treffpunkt."
        aside={
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href="#positionen" className="nv-btn nv-btn-primary">
              Offene Stellen <ArrowRight size={16} aria-hidden />
            </a>
            <Link href="/dashboard" className="nv-btn nv-btn-ghost">
              <ClipboardText size={16} aria-hidden /> Meine Bewerbungen
            </Link>
          </div>
        }
      >
        <Suspense fallback={null}>
          <div className="mb-4 empty:hidden">
            <LiveBadge />
          </div>
        </Suspense>
        <p>
          {BRAND.name} ist der Discord-Server von {BRAND.creator}. Damit Clips, Shorts, Chat und Community rund laufen, suchen wir
          Leute, die mit anpacken – vom Cutter bis zum Supporter.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Suspense fallback={<span className="nv-pill">Mindestalter …</span>}>
            <MinAgePill />
          </Suspense>
          <span className="nv-pill">Login mit Discord</span>
          <span className="nv-pill">Ehrenamtlich</span>
          <span className="nv-pill">Gespräch auf Discord</span>
        </div>
      </PageHero>

      <Container>
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-px overflow-hidden rounded-2xl border border-line bg-[var(--nv-border)] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-bg p-6 nv-anim" style={{ "--i": i } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-red-text">0{i + 1}</span>
                <s.icon size={20} className="text-muted" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>

      <section id="positionen" className="scroll-mt-28 pt-24">
        <Container>
          <SectionTitle label="Team // Offene Stellen" title="Wir suchen" emphasis="Verstärkung.">
            Die Mitarbeit im Team ist ehrenamtlich. Klick auf eine Stelle, um Aufgaben und Anforderungen zu sehen. Unsicher?{" "}
            <Link href="/passt-zu-mir" className="nv-link">
              Welche Stelle passt zu mir?
            </Link>
          </SectionTitle>
          <Suspense fallback={<PositionsSkeleton />}>
            <PositionList />
          </Suspense>
          <Suspense fallback={null}>
            <UpcomingList />
          </Suspense>
        </Container>
      </section>

      <Suspense fallback={null}>
        <RequestCards />
      </Suspense>

      <section id="jannikjbi" className="scroll-mt-28 pt-24">
        <Container>
          <SectionTitle label="Über Jannikjbi" title="Für wen" emphasis="du arbeitest.">
            {BRAND.creator} – gesprochen „{BRAND.pronunciation}“ – ist Jannik aus {BRAND.home}. Auf Twitch spielt er GTA Roleplay auf NRW
            Roleplay als Jannik Heinz: Rettungsdienst im UKK, Taxi und abends die Farm-Route für die Familie. Dazu Simulations- und
            Aufbauspiele.
          </SectionTitle>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="nv-card p-6">
              <div className="flex items-center gap-4">
                <Image src="/logo.png" alt="" width={128} height={128} className="h-16 w-16 rounded-full ring-2 ring-[var(--nv-red-line)]" />
                <div className="min-w-0">
                  <p className="font-display text-3xl leading-none">{BRAND.creator}</p>
                  <p className="mt-1 text-sm text-muted">{BRAND.tagline}</p>
                </div>
              </div>
              <h3 className="mt-6 nv-mono">Streamplan · {STREAM_TIME}</h3>
              <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-1.5 sm:grid-cols-2">
                {STREAM_PLAN.map((d) => (
                  <li key={d.day} className={cn("flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm", d.live ? "bg-red-soft" : "text-faint")}>
                    <span className={cn("w-7 shrink-0 font-mono text-xs", d.live ? "text-red-text" : "")}>{d.day}</span>
                    <span className={d.live ? "text-fg-2" : ""}>{d.what}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={TWITCH_URL} target="_blank" rel="noopener noreferrer" className="nv-btn nv-btn-primary nv-btn-sm">
                  <TwitchLogo size={16} weight="fill" aria-hidden /> Auf Twitch folgen
                </a>
                <a href={publicEnv.mainSiteUrl} target="_blank" rel="noopener noreferrer" className="nv-btn nv-btn-ghost nv-btn-sm">
                  jannikjbi.de <ArrowUpRight size={13} aria-hidden />
                </a>
              </div>
            </div>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 content-start">
              {SOCIALS.map((s, i) => (
                <li key={s.key} className="nv-anim" style={{ "--i": i } as React.CSSProperties}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="nv-card nv-card-hover group flex items-center gap-3 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-line bg-red-soft text-red-text">
                      <SocialIcon kind={s.key} size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{s.label}</span>
                      <span className="block truncate text-xs text-muted">{s.handle}</span>
                    </span>
                    <ArrowUpRight size={14} className="ml-auto shrink-0 text-faint transition-colors group-hover:text-red-text" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section id="discord" className="scroll-mt-28 pt-24">
        <Container>
          <div className="nv-card relative overflow-hidden p-6 sm:p-10">
            <div className="absolute inset-0 nv-hero-glow pointer-events-none" aria-hidden />
            <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
              <div>
                <p className="nv-label">Discord-Server</p>
                <h2 className="nv-headline mt-4 text-3xl sm:text-4xl">
                  Komm in den <em>Treffpunkt.</em>
                </h2>
                <p className="mt-3 text-muted">
                  Bewerben kannst du dich nur, wenn du auf dem Server bist – Gespräch, Rückfragen und die Arbeit im Team laufen über
                  Discord. Kostenlos, mit kurzer Verifizierung gegen Bots und Spam.
                </p>
                <a href={publicEnv.discordInvite} target="_blank" rel="noopener noreferrer" className="nv-btn nv-btn-discord mt-6">
                  <DiscordLogo weight="fill" size={18} aria-hidden /> Server beitreten
                </a>
              </div>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
                {SERVER_FEATURES.map((f) => (
                  <li key={f.title} className="rounded-xl border border-line bg-bg/60 p-4">
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted">{f.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-24">
        <Container>
          <SectionTitle label="Was zählt" title="Ehrlich" emphasis="statt perfekt." />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
            {[
              {
                icon: Handshake,
                title: "Ehrlichkeit",
                text: "Schreib in deinen eigenen Worten. Kopierte oder KI-Texte fallen auf – und bringen dich nicht weiter.",
              },
              {
                icon: ClipboardText,
                title: "Verlässlichkeit",
                text: "Lieber zwei Streams die Woche, die wirklich stattfinden, als jeden Tag auf dem Papier.",
              },
              {
                icon: ShieldCheck,
                title: "Fairness",
                text: "Jede Bewerbung wird von mehreren Leuten gelesen. Entscheidungen treffen Menschen – keine Algorithmen.",
              },
            ].map((c) => (
              <div key={c.title} className="nv-card p-6">
                <c.icon size={22} className="text-red-text" aria-hidden />
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{c.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

async function MinAgePill() {
  await connection();
  const s = await getSettings();
  return <span className="nv-pill">Ab {s["applications.minAge"]} Jahren</span>;
}

async function PositionList() {
  await connection();
  const positions = await listPublicPositions();
  if (positions.length === 0) {
    return <p className="text-muted">Aktuell sind keine Stellen offen. Schau bald wieder vorbei.</p>;
  }
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
      {positions.map((p, i) => (
        <li key={p.id} className="nv-anim" style={{ "--i": i } as React.CSSProperties}>
          <Link href={`/positionen/${p.slug}`} className="nv-card nv-card-hover group flex items-start gap-5 p-6 h-full">
            <IconTile icon={p.icon} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl">{p.title}</h3>
                {deadlineLabel(p.closesAt) && (
                  <span className="nv-pill nv-tone-warn !text-[0.7rem] !py-0.5" data-testid="deadline-label">
                    {deadlineLabel(p.closesAt)}
                  </span>
                )}
                <span className="nv-pill nv-tone-success !text-[0.7rem] !py-0.5">
                  {typeof p.seats === "number" && p.seats > 0 ? `${p.seats} ${p.seats === 1 ? "Platz" : "Plätze"} frei` : "Offen"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              <p className="mt-4 text-sm text-fg-2 line-clamp-2">{p.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-text">
                Details ansehen
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Angelegte, aber noch geschlossene Stellen – kompakt, mit Link zum Benachrichtigen. */
async function UpcomingList() {
  await connection();
  const upcoming = await listUpcomingPositions();
  if (!upcoming.length) return null;
  return (
    <div className="mt-10">
      <h3 className="nv-mono">Demnächst</h3>
      <p className="mt-2 text-sm text-muted">
        Diese Stellen öffnen später. Auf der Seite der Stelle kannst du dich per DM benachrichtigen lassen.
      </p>
      <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
        {upcoming.map((p) => (
          <li key={p.id}>
            <Link href={`/positionen/${p.slug}`} className="nv-card nv-card-hover group flex items-center gap-3 p-4 h-full">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted">
                <PositionIcon icon={p.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{p.title}</span>
                <span className="block text-xs text-muted">{p.opensAt ? `Öffnet am ${formatDay(p.opensAt)}` : "Noch geschlossen"}</span>
              </span>
              <ArrowRight size={14} className="ml-auto shrink-0 text-faint transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Neben den Stellen: alle Anträge (/antraege/<slug>) und die Partner-Anfrage – nur, wenn nicht versteckt. */
async function RequestCards() {
  await connection();
  const [requests, partner] = await Promise.all([
    listRequestPositions(),
    db.position.findFirst({ where: { slug: "partner-anfrage", status: { not: "HIDDEN" }, type: { key: "partner", active: true } }, select: { slug: true, status: true, tagline: true } }),
  ]);
  const cards = [
    ...requests.map((p) => ({ kind: "promo", slug: p.slug, href: positionHref(p.slug, "promo"), icon: p.icon, title: p.title, cta: "Antrag stellen", open: p.status === "OPEN", tagline: p.tagline })),
    ...(partner ? [{ kind: "partner", slug: partner.slug, href: "/partner", icon: "handshake", title: "Partner-Anfrage", cta: "Anfrage stellen", open: partner.status === "OPEN", tagline: partner.tagline }] : []),
  ];
  if (!cards.length) return null;
  return (
    <section id="anfragen" className="scroll-mt-28 pt-16">
      <Container>
        <div className={`grid grid-cols-[minmax(0,1fr)] gap-4 ${cards.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {cards.map((c) => (
            <Link key={c.slug} id={c.kind === "partner" ? "partner" : undefined} href={c.href} className="nv-card nv-card-hover group flex flex-col gap-4 p-6 sm:flex-row sm:items-center scroll-mt-28">
              <IconTile icon={c.icon} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl">{c.title}</h3>
                  <span className={`nv-pill !text-[0.7rem] !py-0.5 ${c.open ? "nv-tone-success" : ""}`}>{c.open ? "Offen" : "Noch geschlossen"}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{c.tagline}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-text">
                {c.open ? c.cta : "Mehr erfahren"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PositionsSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2" aria-busy="true" aria-label="Positionen werden geladen">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="nv-skeleton h-44" />
      ))}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, DiscordLogo } from "@phosphor-icons/react/ssr";
import { hostOf, publicEnv } from "@/lib/env";
import { SOURCE_URL } from "@/lib/legal";
import { BRAND, SOCIALS } from "@/lib/brand";
import { ReadabilityToggles } from "@/components/layout/ReadabilityToggles";
import { SocialIcon } from "@/components/layout/SocialIcon";

const link = "block text-fg-2 hover:text-fg";

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={64} height={64} className="h-10 w-10 rounded-full ring-2 ring-[var(--nv-red-line)]" />
            <span className="font-display text-2xl leading-none">{BRAND.name}</span>
          </div>
          <p className="text-sm text-muted max-w-sm">
            Das Bewerbungsportal für das Team vom Treffpunkt – dem Discord-Server von {BRAND.creator}. {BRAND.tagline}.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={publicEnv.mainSiteUrl} className="nv-btn nv-btn-ghost nv-btn-sm">
              {hostOf(publicEnv.mainSiteUrl)} <ArrowUpRight size={13} aria-hidden />
            </a>
            <a href={publicEnv.discordInvite} target="_blank" rel="noopener noreferrer" className="nv-btn nv-btn-ghost nv-btn-sm">
              <DiscordLogo size={15} weight="fill" aria-hidden /> Discord
            </a>
          </div>
          <ul className="flex flex-wrap gap-1" aria-label={`Kanäle von ${BRAND.creator}`}>
            {SOCIALS.map((s) => (
              <li key={s.key}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:text-fg hover:bg-[color-mix(in_srgb,var(--nv-text)_5%,transparent)]"
                  aria-label={`${s.label} ${s.handle}`}
                >
                  <SocialIcon kind={s.key} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-8 grid-cols-2 sm:grid-cols-3">
          <nav aria-label="Portal" className="space-y-2 text-sm">
            <p className="nv-mono mb-3">Portal</p>
            <Link className={link} href="/#positionen">Offene Stellen</Link>
            <Link className={link} href="/passt-zu-mir">Welche Stelle passt zu mir?</Link>
            <Link className={link} href="/gespraech">So läuft das Gespräch</Link>
            <Link className={link} href="/dashboard">Meine Bewerbungen</Link>
            <Link className={link} href="/konto">Konto &amp; Daten</Link>
          </nav>
          <nav aria-label="Mitmachen" className="space-y-2 text-sm">
            <p className="nv-mono mb-3">Mitmachen</p>
            <Link className={link} href="/antraege">Anträge</Link>
            <Link className={link} href="/partner">Partner-Anfrage</Link>
            <Link className={link} href="/ideen?art=idee">Idee einreichen</Link>
            <Link className={link} href="/ideen?art=feedback">Feedback geben</Link>
            <Link className={link} href="/ideen?art=fehler">Fehler melden</Link>
          </nav>
          <nav aria-label="Rechtliches" className="space-y-2 text-sm">
            <p className="nv-mono mb-3">Rechtliches</p>
            <Link className={link} href="/impressum">Impressum</Link>
            <Link className={link} href="/datenschutz">Datenschutz</Link>
            <a className={link} href={SOURCE_URL} target="_blank" rel="noopener noreferrer">Quellcode (AGPL)</a>
          </nav>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-faint">
            © {BRAND.creator} · Made in {BRAND.home}
          </p>
          <ReadabilityToggles />
        </div>
      </div>
    </footer>
  );
}

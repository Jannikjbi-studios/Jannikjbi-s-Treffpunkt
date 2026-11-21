import { connection } from "next/server";
import { TwitchLogo } from "@phosphor-icons/react/ssr";
import { TWITCH_URL } from "@/lib/brand";
import { getLiveStatus } from "@/lib/twitch";

/** „Jannik ist live“ – nur wenn Twitch eingerichtet ist und gerade ein Stream läuft. */
export async function LiveBadge() {
  await connection();
  const s = await getLiveStatus();
  if (!s?.live) return null;
  return (
    <a
      href={TWITCH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="nv-anim inline-flex max-w-full items-center gap-2 rounded-full border border-[color-mix(in_srgb,#9146ff_45%,transparent)] bg-[color-mix(in_srgb,#9146ff_14%,transparent)] px-3 py-1.5 text-sm hover:bg-[color-mix(in_srgb,#9146ff_22%,transparent)]"
      data-testid="live-badge"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff4d4d] nv-pulse-dot" aria-hidden />
      </span>
      <span className="font-semibold">Jannik ist live</span>
      <TwitchLogo size={15} weight="fill" className="shrink-0 text-[#a970ff]" aria-hidden />
      <span className="truncate text-fg-2">
        {s.game ? `${s.game}` : "Twitch"}
        {s.title ? ` – ${s.title}` : ""}
      </span>
    </a>
  );
}

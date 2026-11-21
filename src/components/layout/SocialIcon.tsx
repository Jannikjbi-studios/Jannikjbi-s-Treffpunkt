import { Butterfly, Coffee, InstagramLogo, SteamLogo, TiktokLogo, TwitchLogo, YoutubeLogo } from "@phosphor-icons/react/ssr";
import type { SocialLink } from "@/lib/brand";

const ICONS = {
  twitch: TwitchLogo,
  youtube: YoutubeLogo,
  tiktok: TiktokLogo,
  instagram: InstagramLogo,
  kofi: Coffee,
  bluesky: Butterfly,
  steam: SteamLogo,
} as const;

/** Icon zu einem Kanal von Jannikjbi (Twitch, YouTube …). */
export function SocialIcon({ kind, size = 18 }: { kind: SocialLink["key"]; size?: number }) {
  const I = ICONS[kind];
  return <I size={size} weight="fill" aria-hidden />;
}

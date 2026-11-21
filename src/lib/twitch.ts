/**
 * „Jannik ist live“: Stream-Status von Twitch (Helix API).
 * Braucht TWITCH_CLIENT_ID und TWITCH_CLIENT_SECRET (dev.twitch.tv → Applications).
 * Ohne Angaben gibt es keine Anzeige. Ergebnis wird pro Server-Instanz 2 Minuten
 * gemerkt – kaum Aufrufe bei Twitch, keine Cache-Schreibvorgänge bei Vercel.
 */
import { TWITCH_URL } from "@/lib/brand";

export interface LiveStatus {
  live: boolean;
  title?: string;
  game?: string;
  viewers?: number;
}

const TTL_MS = 120_000;
const LOGIN = new URL(TWITCH_URL).pathname.replace(/\//g, "") || "jannikjbi";
let token: { value: string; until: number } | null = null;
let cached: { at: number; data: LiveStatus } | null = null;

export const twitchConfigured = () => !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);

async function appToken(): Promise<string> {
  if (token && Date.now() < token.until) return token.value;
  const body = new URLSearchParams({ client_id: process.env.TWITCH_CLIENT_ID!, client_secret: process.env.TWITCH_CLIENT_SECRET!, grant_type: "client_credentials" });
  const r = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(3000) });
  if (!r.ok) throw new Error(`Twitch-Token: ${r.status}`);
  const j = (await r.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, until: Date.now() + Math.max(60, j.expires_in - 300) * 1000 };
  return token.value;
}

/** Rein: Antwort von /helix/streams in einen Status übersetzen. */
export function parseStreams(json: unknown): LiveStatus {
  const s = (json as { data?: { type?: string; title?: string; game_name?: string; viewer_count?: number }[] })?.data?.[0];
  if (!s || s.type !== "live") return { live: false };
  return { live: true, title: s.title?.slice(0, 140), game: s.game_name, viewers: s.viewer_count };
}

/** Ist Jannik gerade live? null = nicht eingerichtet oder Twitch nicht erreichbar. */
export async function getLiveStatus(): Promise<LiveStatus | null> {
  if (!twitchConfigured()) return null;
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  try {
    const call = async () =>
      fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(LOGIN)}`, {
        headers: { "Client-Id": process.env.TWITCH_CLIENT_ID!, Authorization: `Bearer ${await appToken()}` },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
    let r = await call();
    if (r.status === 401) {
      token = null; // Token abgelaufen → einmal neu holen
      r = await call();
    }
    if (!r.ok) throw new Error(`Twitch: ${r.status}`);
    const data = parseStreams(await r.json());
    cached = { at: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? null;
  }
}

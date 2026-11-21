/**
 * Farbe je Stelle (nach Icon) – für das Banner des Einzelaufrufs und die
 * Akzentleiste der Discord-Nachricht. Rein, ohne Server-Abhängigkeiten.
 */
const ACCENTS: Record<string, string> = {
  scissors: "#FF6B4A", // ✂️ Cutter
  phone: "#FF5CA8", // 📱 Social-Media
  microphone: "#9146FF", // 🎙️ Stream-Mod
  sword: "#3DA5FF", // ⚔️ Moderator
  headset: "#2ECC71", // 🎧 Supporter
  palette: "#FFC123", // 🎨 Designer
  tent: "#F28C28", // 🎪 Event-Team
  handshake: "#14C8B8", // 🤝 Partner-Manager
  megaphone: "#FFC123",
};

export const DEFAULT_ACCENT = "#FFC123";

export const accentHex = (icon: string | null | undefined) => ACCENTS[icon ?? ""] ?? DEFAULT_ACCENT;
export const accentInt = (icon: string | null | undefined) => parseInt(accentHex(icon).slice(1), 16);

/** Kurzer Stand der Banner-Inhalte – ändert sich Titel, Text oder Icon, gibt es eine neue Bild-URL (Discord merkt sich Bilder). */
export function bannerVersion(p: { title: string; tagline: string; icon: string }) {
  let h = 5381;
  for (const ch of `${p.title}|${p.tagline}|${p.icon}`) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(36);
}

/** Titel für das Banner: Teil vor dem ersten Bindestrich wird farbig („STREAM-“ MOD). */
export function bannerTitle(title: string): { lead: string; rest: string } {
  const t = title.toUpperCase();
  const i = t.indexOf("-");
  return i > 0 && i < t.length - 1 ? { lead: t.slice(0, i + 1), rest: t.slice(i + 1) } : { lead: "", rest: t };
}

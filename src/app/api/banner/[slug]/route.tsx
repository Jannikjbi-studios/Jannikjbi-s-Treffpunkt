/**
 * Banner für den Einzelaufruf einer Stelle („Wir suchen …“), z. B. /api/banner/cutter.
 * Wird bei Bedarf erzeugt (nichts gespeichert) und vom CDN zwischengespeichert. Der Bot
 * hängt es oben an den Einzelaufruf; ?v=… wechselt, sobald sich Titel, Text oder Icon ändern.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import {
  Camera,
  Code,
  Confetti,
  Cube,
  DeviceMobile,
  Flask,
  Handshake,
  Headset,
  IdentificationCard,
  Megaphone,
  Microphone,
  Palette,
  Scissors,
  ShieldCheck,
  Sword,
  Tent,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { db } from "@/lib/db";
import { accentHex, bannerTitle } from "@/lib/messages/position-accent";

const ICONS = {
  scissors: Scissors,
  phone: DeviceMobile,
  microphone: Microphone,
  sword: Sword,
  headset: Headset,
  palette: Palette,
  tent: Tent,
  handshake: Handshake,
  megaphone: Megaphone,
  shield: ShieldCheck,
  code: Code,
  camera: Camera,
  cube: Cube,
  confetti: Confetti,
  users: UsersThree,
  id: IdentificationCard,
  flask: Flask,
};

const W = 1600;
const H = 400;

// Schriften und Logo einmal pro Instanz laden
const assets = (async () => {
  const dir = join(process.cwd(), "assets/fonts");
  const [barlow, inter400, inter600, logo] = await Promise.all([
    readFile(join(dir, "barlow-condensed-700.woff")),
    readFile(join(dir, "inter-400.woff")),
    readFile(join(dir, "inter-600.woff")),
    readFile(join(process.cwd(), "public/logo.png")),
  ]);
  return {
    fonts: [
      { name: "Barlow Condensed", data: barlow, weight: 700 as const, style: "normal" as const },
      { name: "Inter", data: inter400, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data: inter600, weight: 600 as const, style: "normal" as const },
    ],
    logo: `data:image/png;base64,${logo.toString("base64")}`,
  };
})();

/** Phosphor-Icons (forwardRef) in schlichte <svg>/<path>-Elemente auflösen – Satori kennt nur HTML/SVG. */
function plain(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(plain);
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ children?: ReactNode }>;
  const type = el.type as unknown;
  if (type === Fragment) return Children.toArray(el.props.children).map(plain);
  if (typeof type === "object" && type !== null && "render" in type) {
    return plain((type as { render: (props: unknown, ref: unknown) => ReactNode }).render(el.props, null));
  }
  if (typeof type === "function") return plain((type as (props: unknown) => ReactNode)(el.props));
  const kids = el.props.children;
  return kids === undefined ? el : cloneElement(el, undefined, ...Children.toArray(kids).map(plain));
}

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export async function GET(_req: Request, ctx: RouteContext<"/api/banner/[slug]">) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return new Response("Nicht gefunden", { status: 404 });
  const p = await db.position.findFirst({ where: { slug, status: { not: "HIDDEN" } }, select: { title: true, tagline: true, icon: true, type: { select: { key: true } } } });
  if (!p) return new Response("Nicht gefunden", { status: 404 });

  const { fonts, logo } = await assets;
  const accent = accentHex(p.icon);
  const Icon = ICONS[p.icon as keyof typeof ICONS] ?? UsersThree;
  const { lead, rest } = bannerTitle(p.title);
  const titleSize = p.title.length > 13 ? 128 : 150;
  const tagline = p.tagline.length > 95 ? `${p.tagline.slice(0, 94).trimEnd()} …` : p.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#070a12",
          backgroundImage: `radial-gradient(circle at 12% 15%, ${rgba(accent, 0.3)}, rgba(7,10,18,0) 55%), radial-gradient(circle at 95% 110%, ${rgba(accent, 0.14)}, rgba(7,10,18,0) 50%)`,
          fontFamily: "Inter",
          color: "#eef1f8",
        }}
      >
        {/* großes Icon als Wasserzeichen */}
        <div style={{ position: "absolute", right: -50, top: -20, display: "flex", opacity: 0.08, transform: "rotate(-12deg)" }}>
          {plain(<Icon size={460} weight="fill" color={accent} />)}
        </div>

        <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", padding: "0 86px", gap: 58 }}>
          <div
            style={{
              width: 224,
              height: 224,
              flexShrink: 0,
              borderRadius: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `3px solid ${rgba(accent, 0.5)}`,
              backgroundImage: `linear-gradient(160deg, ${rgba(accent, 0.24)}, ${rgba(accent, 0.06)})`,
              boxShadow: `0 0 80px ${rgba(accent, 0.3)}`,
            }}
          >
            {plain(<Icon size={136} weight="duotone" color={accent} />)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1080 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 20, fontWeight: 600, letterSpacing: 7, color: accent }}>
              <div style={{ width: 38, height: 3, backgroundColor: accent }} />
              {`JANNIKJBI'S TREFFPUNKT · ${p.type.key === "team" ? "WIR SUCHEN" : "JETZT ANFRAGEN"}`}
            </div>
            <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: titleSize, lineHeight: 0.95, marginTop: 16, letterSpacing: 1 }}>
              {lead && <span style={{ color: accent }}>{lead}</span>}
              <span style={{ color: "#ffffff" }}>{rest}</span>
            </div>
            <div style={{ display: "flex", fontSize: 29, marginTop: 18, color: "#b9c1d6", lineHeight: 1.3 }}>{tagline}</div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 32,
            right: 38,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "8px 20px 8px 8px",
            borderRadius: 999,
            backgroundColor: "rgba(7,10,18,0.7)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 19,
            fontWeight: 600,
            color: "#dfe4f0",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={44} height={44} alt="" style={{ borderRadius: 999, border: `2px solid ${rgba(accent, 0.8)}` }} />
          jannikjbi.de
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 7, backgroundImage: `linear-gradient(90deg, ${accent}, ${rgba(accent, 0.25)} 70%, rgba(7,10,18,0))` }} />
      </div>
    ),
    {
      width: W,
      height: H,
      fonts,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}

import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/** Web-App-Manifest: Portal lässt sich auf den Startbildschirm legen und startet ohne Browserleiste. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} – Team-Bewerbung`,
    short_name: BRAND.short,
    description: `Bewerbungen fürs Team von ${BRAND.name}, dem Discord-Server von ${BRAND.creator}.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070a12",
    theme_color: "#070a12",
    lang: "de",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Meine Bewerbungen", url: "/dashboard" },
      { name: "Team-Bereich", url: "/team" },
    ],
  };
}

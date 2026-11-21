import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ConfirmHost } from "@/components/ConfirmDialog";
import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import "./globals.css";

// Wie auf jannikjbi.de: Barlow Condensed für Überschriften, Inter für Text
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.appUrl),
  title: { default: `Team-Bewerbung | ${BRAND.name}`, template: `%s | ${BRAND.name}` },
  description: `Werde Teil vom Team von ${BRAND.name}, dem Discord-Server von ${BRAND.creator}: Cutter, Social-Media, Stream-Mod, Moderator und Supporter. Offene Stellen ansehen, ehrlich bewerben, Stand jederzeit verfolgen.`,
  icons: { icon: "/logo.png", apple: "/icons/apple-180.png" },
  // Vom Startbildschirm geöffnet: ohne Browserleiste, eigener Name
  appleWebApp: { capable: true, title: BRAND.short, statusBarStyle: "black" },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "de_DE",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: BRAND.name }],
  },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  themeColor: "#070a12",
  colorScheme: "dark light",
};

// Setzt das Theme vor dem ersten Paint (kein Aufblitzen). Standard: dunkel.
// Dazu Lesbarkeit (größere Schrift, mehr Kontrast) – pro Gerät gespeichert.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('nv-theme');if(t!=='light'&&t!=='dark'){t='dark'}d.dataset.theme=t;if(localStorage.getItem('nv-text')==='large')d.dataset.text='large';if(localStorage.getItem('nv-contrast')==='high')d.dataset.contrast='high'}catch(e){d.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${barlow.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] nv-btn nv-btn-primary"
        >
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="inhalt" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ConfirmHost />
      </body>
    </html>
  );
}

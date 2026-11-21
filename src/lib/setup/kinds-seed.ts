/**
 * Startinhalte für weitere Bewerbungsarten neben „Team“: Bewerbungsart,
 * eine „Stelle“ je Art (startet geschlossen – Admins öffnen sie, sobald Rolle
 * und Fragen passen), Abschnitte mit Fragen und passende Nachrichtenbausteine.
 */
import type { PositionStatus, TemplateCategory } from "@prisma/client";
import type { SeedSection } from "@/lib/setup/questions";
import type { KindKey } from "@/lib/kinds";

export interface KindSeed {
  type: { key: KindKey; name: string; description: string };
  position: {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    icon: string;
    status: PositionStatus;
    cooldownDays: number;
    tasks: string[];
    requirements: string[];
    sections: SeedSection[];
  };
  templates: { category: TemplateCategory; title: string; body: string }[];
}

/**
 * Jannikjbi's Treffpunkt hat nur Team-Bewerbungen – keine weiteren Arten.
 * Eine neue Art (z. B. eine Anmeldung mit eigener Rolle) bekommt hier ihre
 * Startinhalte und in src/lib/kinds.ts ihre Einstellungen.
 */
export const KIND_SEEDS: KindSeed[] = [];

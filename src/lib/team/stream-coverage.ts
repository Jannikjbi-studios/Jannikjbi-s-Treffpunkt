/**
 * Stream-Abdeckung: An welchen Streamtagen haben Stream-Mods Zeit?
 * Grundlage ist die Frage „stream-mod.days“ (Mehrfachauswahl) aus der Bewerbung.
 * Angenommene Stream-Mods zählen als Abdeckung, offene Bewerbungen als „in Aussicht“.
 */
import type { PrismaClient } from "@prisma/client";
import { STREAM_PLAN } from "@/lib/brand";

export const STREAM_DAYS_KEY = "stream-mod.days";

const FULL: Record<string, string> = { Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag", Sa: "Samstag", So: "Sonntag" };
/** Streamtage laut Streamplan (src/lib/brand.ts), z. B. Montag, Dienstag, Freitag, Samstag. */
export const STREAM_DAYS: string[] = STREAM_PLAN.filter((d) => d.live).map((d) => FULL[d.day] ?? d.day);

export interface CoverageRow {
  name: string;
  days: string[];
  accepted: boolean;
}

export interface DayCoverage {
  day: string;
  mods: string[];
  pending: number;
}

/** Rein: Abdeckung je Streamtag aus den Antworten. */
export function coverageByDay(rows: CoverageRow[], days: string[] = STREAM_DAYS): DayCoverage[] {
  return days.map((day) => ({
    day,
    mods: rows.filter((r) => r.accepted && r.days.includes(day)).map((r) => r.name),
    pending: rows.filter((r) => !r.accepted && r.days.includes(day)).length,
  }));
}

export async function loadStreamCoverage(db: PrismaClient): Promise<DayCoverage[] | null> {
  const questions = await db.question.findMany({ where: { key: STREAM_DAYS_KEY }, select: { id: true } });
  if (!questions.length) return null;
  const answers = await db.answer.findMany({
    where: {
      questionId: { in: questions.map((q) => q.id) },
      application: {
        isTest: { not: true },
        OR: [{ status: "ACCEPTED", NOT: { probationResult: "ENDED" } }, { status: { in: ["SUBMITTED", "IN_REVIEW", "INTERVIEW"] } }],
      },
    },
    select: { value: true, application: { select: { status: true, user: { select: { globalName: true, username: true } } } } },
    take: 500,
  });
  const rows: CoverageRow[] = answers.map((a) => ({
    name: a.application.user.globalName || a.application.user.username,
    days: Array.isArray(a.value) ? (a.value as unknown[]).filter((x): x is string => typeof x === "string") : [],
    accepted: a.application.status === "ACCEPTED",
  }));
  return coverageByDay(rows);
}

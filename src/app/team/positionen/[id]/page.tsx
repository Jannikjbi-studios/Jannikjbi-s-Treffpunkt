import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { PositionForm } from "@/components/team/PositionForm";
import { FormBuilder } from "@/components/team/FormBuilder";
import { kindOf } from "@/lib/kinds";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { POSITIONS } from "@/lib/setup/seed-data";
import { isOwner } from "@/lib/auth/owner";

/** Geplante Discord-Rollen der mitgelieferten Stellen (Hinweis für Admins beim Eintragen der IDs). */
function roleHintFor(slug: string) {
  const r = POSITIONS.find((p) => p.slug === slug)?.roles;
  return r ? (r.afterProbation ? `${r.accept} → nach der Probezeit ${r.afterProbation}` : r.accept) : undefined;
}

export const metadata: Metadata = { title: "Position bearbeiten" };

export default function PositionEditPage({ params }: PageProps<"/team/positionen/[id]">) {
  return (
    <div className="space-y-6">
      <Link href="/team/positionen" className="nv-btn nv-btn-quiet nv-btn-sm -ml-3">
        <ArrowLeft size={14} aria-hidden /> Alle Positionen
      </Link>
      <Suspense fallback={<div className="nv-skeleton h-[40rem]" />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

async function Editor({ params }: Pick<PageProps<"/team/positionen/[id]">, "params">) {
  const ctx = await requireAdmin();
  const owner = isOwner(ctx);
  const { id } = await params;

  if (id === "neu" || id === "neuer-antrag") {
    const antrag = id === "neuer-antrag";
    return (
      <>
        <h1 className="nv-headline text-4xl">
          {antrag ? "Neuer" : "Neue"} <em>{antrag ? "Antrag." : "Position."}</em>
        </h1>
        {antrag && (
          <p className="text-sm text-muted max-w-2xl">
            Erscheint unter /antraege/&lt;slug&gt;. Nach dem Speichern legst du unten die Fragen an. Tipp: Schneller geht&apos;s mit „Duplizieren“ bei der Sponsoring-Anfrage – dann
            sind die Fragen schon da.
          </p>
        )}
        <PositionForm position={null} owner={owner} kind={antrag ? "promo" : "team"} />
      </>
    );
  }

  const isGeneral = id === "allgemein";
  const position = isGeneral ? null : await db.position.findUnique({ where: { id }, include: { type: { select: { key: true } } } });
  if (!isGeneral && !position) notFound();
  const kind = kindOf(position?.type.key);

  const applicationCount = position
    ? await db.application.count({ where: { positionId: position.id, submittedAt: { not: null }, status: { not: "WITHDRAWN" } } })
    : 0;
  const sections = await db.formSection.findMany({
    where: { positionId: isGeneral ? null : position!.id, NOT: { archived: true } },
    orderBy: { sortOrder: "asc" },
    include: { questions: { where: { archived: false }, orderBy: { sortOrder: "asc" } } },
  });
  // Alle aktiven Fragen (allgemein + alle Positionen) für die Duplikat-Warnung im Builder
  const allQuestions = await db.question.findMany({
    where: { archived: false, section: { NOT: { archived: true } } },
    select: { id: true, key: true, label: true, section: { select: { title: true, position: { select: { title: true } } } } },
  });

  return (
    <>
      <h1 className="nv-headline text-4xl">
        {isGeneral ? (
          <>
            Allgemeine <em>Fragen.</em>
          </>
        ) : (
          <>
            {position!.title} <em>bearbeiten.</em>
          </>
        )}
      </h1>
      {position && (
        <PositionForm
          position={{
            id: position.id,
            slug: position.slug,
            title: position.title,
            tagline: position.tagline,
            description: position.description,
            tasks: position.tasks,
            requirements: position.requirements,
            icon: position.icon,
            status: position.status,
            minAge: position.minAge,
            cooldownDays: position.cooldownDays,
            acceptRoleId: position.acceptRoleId,
            passRoleId: position.passRoleId ?? null,
            extraRoleIds: position.extraRoleIds ?? [],
            opensAt: position.opensAt?.toISOString() ?? null,
            closesAt: position.closesAt?.toISOString() ?? null,
            maxApplications: position.maxApplications ?? null,
            quizMinScore: position.quizMinScore ?? null,
            quizDrawCount: position.quizDrawCount ?? null,
            interviewQuestions: position.interviewQuestions ?? [],
            reviewChecklist: position.reviewChecklist ?? [],
            minProVotes: position.minProVotes ?? null,
            ratingCriteria: position.ratingCriteria ?? [],
            seats: position.seats ?? null,
            nickPrefix: position.nickPrefix ?? null,
            requireAdminApproval: !!position.requireAdminApproval,
            teamRoleIds: position.teamRoleIds ?? [],
          }}
          applicationCount={applicationCount}
          roleHint={roleHintFor(position.slug)}
          owner={owner}
          kind={kind.key}
        />
      )}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Formular-Schritte</h2>
          <p className="text-sm text-muted">
            {isGeneral
              ? "Diese Schritte sehen alle Bewerber, egal für welche Position."
              : kind.teamFeatures
                ? "Diese Schritte kommen nach den allgemeinen Fragen – nur für diese Position."
                : `Das sind alle Fragen der ${kind.noun} (ohne allgemeine Team-Fragen). Schritte und Fragen kannst du hier anlegen, ändern, sortieren und archivieren.`}{" "}
            Geänderte Fragen wirken nur auf neue Bewerbungen; eingereichte Antworten bleiben unverändert.
          </p>
        </div>
        <FormBuilder
          positionId={position?.id ?? null}
          keyPrefix={position?.slug ?? null}
          existingQuestions={allQuestions.map((q) => ({
            id: q.id,
            key: q.key,
            label: q.label,
            where: `${q.section.position?.title ?? "Allgemein"} › ${q.section.title}`,
          }))}
          sections={sections.map((s) => ({
            id: s.id,
            key: s.key,
            general: s.positionId === null,
            title: s.title,
            description: s.description,
            questions: s.questions.map((q) => ({
              id: q.id,
              key: q.key,
              label: q.label,
              helpText: q.helpText,
              placeholder: q.placeholder,
              type: q.type,
              required: q.required,
              minLength: q.minLength,
              maxLength: q.maxLength,
              minValue: q.minValue,
              maxValue: q.maxValue,
              options: q.options,
              correctOption: q.correctOption,
            })),
          }))}
        />
      </section>
    </>
  );
}

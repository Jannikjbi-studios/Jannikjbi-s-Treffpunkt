"use client";

import { useState, useTransition } from "react";
import type { ClipStatus } from "@prisma/client";
import { ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { deleteClipAction, markClipPostedAction, resubmitClipAction, sendBackClipAction, setClipPlatformAction } from "@/app/actions/content";
import { CLIP_PLATFORMS, CLIP_STATUS_LABEL, type ClipPlatform } from "@/lib/content/clips";
import type { ActionResult } from "@/app/actions/application";
import { cn } from "@/components/ui";

export interface ClipView {
  id: string;
  title: string;
  url: string;
  note: string | null;
  feedback: string | null;
  status: ClipStatus;
  streamDay: string | null;
  createdDay: string;
  by: string;
  handledBy: string | null;
  done: Record<ClipPlatform, boolean>;
  mine: boolean;
}

const TONE: Record<ClipStatus, string> = {
  READY: "nv-tone-accent",
  NEEDS_CHANGES: "nv-tone-warn",
  POSTED: "nv-tone-success",
};

export function ClipCard({ clip, isTeam }: { clip: ClipView; isTeam: boolean }) {
  const [pending, run] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"none" | "feedback" | "resubmit">("none");
  const [feedback, setFeedback] = useState("");
  const [url, setUrl] = useState(clip.url);
  const [note, setNote] = useState(clip.note ?? "");
  // Haken sofort zeigen, bei Fehler zurücknehmen (nach dem Speichern kommt der Stand vom Server)
  const [done, setDone] = useState(clip.done);

  const act = (fn: () => Promise<ActionResult>, after?: () => void) =>
    run(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error);
      else after?.();
    });

  const canDelete = isTeam || (clip.mine && clip.status !== "POSTED");

  return (
    <li id={clip.id} className="nv-card p-4 sm:p-5 space-y-3 scroll-mt-28 target:ring-2 target:ring-[var(--nv-red)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold break-words">{clip.title}</p>
          <p className="text-xs text-muted mt-0.5">
            von {clip.by} · {clip.createdDay}
            {clip.streamDay && <> · Stream vom {clip.streamDay}</>}
          </p>
        </div>
        <span className={cn("nv-pill !text-[0.7rem] !py-0.5", TONE[clip.status])}>{CLIP_STATUS_LABEL[clip.status]}</span>
      </div>

      <a
        href={clip.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1.5 text-sm text-red-text hover:underline break-all"
      >
        Datei öffnen <ArrowSquareOut size={14} aria-hidden />
      </a>
      {clip.note && <p className="text-sm text-fg-2 whitespace-pre-line">{clip.note}</p>}
      {clip.feedback && clip.status === "NEEDS_CHANGES" && (
        <div className="rounded-xl border border-line bg-surface-2/40 px-3 py-2 text-sm">
          <p className="nv-mono mb-1">Feedback{clip.handledBy ? ` von ${clip.handledBy}` : ""}</p>
          <p className="whitespace-pre-line">{clip.feedback}</p>
        </div>
      )}

      <fieldset className="flex flex-wrap gap-2" disabled={pending}>
        <legend className="sr-only">Hochgeladen auf</legend>
        {CLIP_PLATFORMS.map((p) => (
          <label
            key={p.key}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm cursor-pointer select-none",
              done[p.key] ? "border-[var(--tone-success)] bg-[color-mix(in_srgb,var(--tone-success)_10%,transparent)]" : "border-line hover:bg-surface-2/50",
            )}
          >
            <input
              type="checkbox"
              className="accent-[var(--nv-red)]"
              checked={done[p.key]}
              onChange={(e) => {
                const on = e.target.checked;
                setDone((d) => ({ ...d, [p.key]: on }));
                act(async () => {
                  const r = await setClipPlatformAction(clip.id, p.key, on);
                  if (!r.ok) setDone((d) => ({ ...d, [p.key]: !on }));
                  return r;
                });
              }}
            />
            {p.label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        {clip.status !== "POSTED" && (
          <button type="button" className="nv-btn nv-btn-ghost nv-btn-sm" disabled={pending} onClick={() => act(() => markClipPostedAction(clip.id))}>
            Fertig – überall hochgeladen
          </button>
        )}
        {clip.status === "READY" && (
          <button type="button" className="nv-btn nv-btn-ghost nv-btn-sm" disabled={pending} onClick={() => setMode(mode === "feedback" ? "none" : "feedback")}>
            Zurück an den Cutter
          </button>
        )}
        {clip.status === "NEEDS_CHANGES" && (clip.mine || isTeam) && (
          <button
            type="button"
            className="nv-btn nv-btn-primary nv-btn-sm"
            disabled={pending}
            onClick={() => setMode(mode === "resubmit" ? "none" : "resubmit")}
          >
            Neue Version hochladen
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            className="nv-btn nv-btn-ghost nv-btn-sm text-[var(--tone-danger)]"
            disabled={pending}
            onClick={() => confirm(`„${clip.title}“ wirklich löschen?`) && act(() => deleteClipAction(clip.id))}
          >
            Löschen
          </button>
        )}
      </div>

      {mode === "feedback" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            act(
              () => sendBackClipAction(clip.id, feedback),
              () => setMode("none"),
            );
          }}
        >
          <label htmlFor={`fb-${clip.id}`} className="nv-field-label">
            Was soll geändert werden?
          </label>
          <textarea
            id={`fb-${clip.id}`}
            className="nv-input !min-h-20"
            maxLength={500}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="z. B. Untertitel ab 0:12 verrutscht, Titel größer"
          />
          <button type="submit" className="nv-btn nv-btn-primary nv-btn-sm" disabled={pending}>
            Zurückgeben (DM an {clip.by})
          </button>
        </form>
      )}
      {mode === "resubmit" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            act(
              () => resubmitClipAction(clip.id, { url, note }),
              () => setMode("none"),
            );
          }}
        >
          <label htmlFor={`url-${clip.id}`} className="nv-field-label">
            Link zur neuen Version
          </label>
          <input id={`url-${clip.id}`} type="url" className="nv-input" maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} />
          <label htmlFor={`note-${clip.id}`} className="nv-field-label">
            Hinweise
          </label>
          <textarea id={`note-${clip.id}`} className="nv-input !min-h-16" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" className="nv-btn nv-btn-primary nv-btn-sm" disabled={pending}>
            Wieder bereitstellen
          </button>
        </form>
      )}
      {error && (
        <p className="nv-error text-sm" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

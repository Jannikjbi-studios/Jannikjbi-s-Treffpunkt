"use client";

import { useState, useTransition } from "react";
import { submitClipAction } from "@/app/actions/content";

/** Cutter: fertiges Short einreichen (Link zur Datei, kein Upload – spart Speicher). */
export function ClipForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [streamDate, setStreamDate] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, run] = useTransition();

  return (
    <form
      className="nv-card p-5 sm:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setErrors({});
        setSent(false);
        run(async () => {
          const r = await submitClipAction({ title, url, streamDate, note });
          if (!r.ok) {
            setError(r.error);
            setErrors(r.fieldErrors ?? {});
            return;
          }
          setTitle("");
          setUrl("");
          setStreamDate("");
          setNote("");
          setSent(true);
        });
      }}
    >
      <div>
        <p className="font-semibold">Neues Short einreichen</p>
        <p className="text-sm text-muted mt-0.5">Lade die fertige Datei bei Google Drive, Dropbox o. Ä. hoch und füg hier den Link ein. Social-Media bekommt Bescheid.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="clip-title" className="nv-field-label">Titel</label>
          <input id="clip-title" className="nv-input" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. „Der Taxi-Crash des Jahres“" aria-invalid={!!errors.title} />
          {errors.title && <p className="nv-error text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="clip-date" className="nv-field-label">
            Aus dem Stream vom <span className="text-muted font-normal">(optional)</span>
          </label>
          <input id="clip-date" type="date" className="nv-input" value={streamDate} onChange={(e) => setStreamDate(e.target.value)} aria-invalid={!!errors.streamDate} />
          {errors.streamDate && <p className="nv-error text-xs mt-1">{errors.streamDate}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="clip-url" className="nv-field-label">Link zur Datei</label>
        <input id="clip-url" type="url" inputMode="url" className="nv-input" maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/…" aria-invalid={!!errors.url} />
        {errors.url && <p className="nv-error text-xs mt-1">{errors.url}</p>}
      </div>
      <div>
        <label htmlFor="clip-note" className="nv-field-label">
          Hinweise <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea id="clip-note" className="nv-input !min-h-20" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Beschreibung, Hashtags, Musik-Hinweis" aria-invalid={!!errors.note} />
        {errors.note && <p className="nv-error text-xs mt-1">{errors.note}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="nv-btn nv-btn-primary" disabled={pending}>
          {pending ? "Sende …" : "Einreichen"}
        </button>
        {sent && <span className="text-sm text-[var(--tone-success)]" role="status">Eingereicht ✓</span>}
        {error && !Object.keys(errors).length && <span className="nv-error text-sm">{error}</span>}
      </div>
    </form>
  );
}

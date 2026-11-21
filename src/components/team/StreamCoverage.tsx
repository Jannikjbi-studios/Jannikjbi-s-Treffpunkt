import Link from "next/link";
import { Microphone } from "@phosphor-icons/react/ssr";
import { db } from "@/lib/db";
import { loadStreamCoverage } from "@/lib/team/stream-coverage";

/** Team-Übersicht: Welcher Streamtag hat schon einen Stream-Mod? */
export async function StreamCoverage() {
  const days = await loadStreamCoverage(db);
  if (!days) return null;
  return (
    <section className="nv-card p-5" data-testid="stream-coverage">
      <header className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <span className="text-red-text">
            <Microphone size={18} aria-hidden />
          </span>{" "}
          Stream-Abdeckung
        </h2>
        <Link href="/team/bewerbungen?position=stream-mod" className="nv-btn nv-btn-quiet nv-btn-sm">
          Bewerbungen
        </Link>
      </header>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
        {days.map((d) => (
          <li key={d.day} className={`rounded-xl border p-3 text-sm ${d.mods.length ? "border-line" : "border-[color-mix(in_srgb,var(--tone-warn)_40%,transparent)]"}`}>
            <p className="flex items-center justify-between gap-2 font-medium">
              {d.day}
              <span className={`nv-pill !text-[0.7rem] !py-0 ${d.mods.length ? "nv-tone-success" : "nv-tone-warn"}`}>{d.mods.length ? `${d.mods.length} Mod${d.mods.length > 1 ? "s" : ""}` : "kein Mod"}</span>
            </p>
            <p className="mt-1 text-xs text-muted truncate">{d.mods.length ? d.mods.join(", ") : "Noch niemand eingeplant"}</p>
            {d.pending > 0 && <p className="mt-1 text-xs text-fg-2">+ {d.pending} in offenen Bewerbungen</p>}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted mt-3">Aus der Bewerbungsfrage „An welchen Streamtagen …“ – angenommene Stream-Mods und offene Bewerbungen.</p>
    </section>
  );
}

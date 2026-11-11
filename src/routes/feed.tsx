import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { SignalCard } from "@/components/signal-card";
import { SignalDrawer } from "@/components/signal-drawer";
import { Button } from "@/components/ui/button";
import { DESK } from "@/data/briefing";
import { fetchArxiv } from "@/lib/arxiv.functions";
import { DOMAIN_LABEL, type Domain, type Signal } from "@/lib/types";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({ component: FeedPage });

type Wire =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; signals: Signal[]; fetchedAt: string; warnings: string[] };

const FILTERS: { id: "all" | Domain | "desk"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "desk", label: "Desk" },
  { id: "ai", label: DOMAIN_LABEL.ai },
  { id: "hardware", label: DOMAIN_LABEL.hardware },
  { id: "materials", label: DOMAIN_LABEL.materials },
  { id: "physics", label: DOMAIN_LABEL.physics },
  { id: "wildcard", label: DOMAIN_LABEL.wildcard },
];

function FeedPage() {
  const [wire, setWire] = useState<Wire>({ state: "idle" });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState<Signal | null>(null);

  async function pull() {
    setWire({ state: "loading" });
    const result = await fetchArxiv();
    if (!result.ok) {
      setWire({ state: "error", message: result.error });
      return;
    }
    setWire({
      state: "ready",
      signals: result.signals,
      fetchedAt: result.fetchedAt,
      warnings: result.warnings,
    });
  }

  const rows = useMemo(() => {
    const live = wire.state === "ready" ? wire.signals : [];
    const deskIds = new Set(
      DESK.flatMap((s) => s.sources.map((source) => source.url.match(/(\d{4}\.\d{4,5})/)?.[1])).filter(Boolean),
    );
    const fresh = live.filter((s) => !deskIds.has(s.id.replace("arxiv:", "")));
    let combined: Signal[] = [...DESK, ...fresh];
    if (filter === "desk") combined = combined.filter((s) => s.origin === "desk");
    else if (filter !== "all") combined = combined.filter((s) => s.domain === filter);
    combined.sort((a, b) => {
      const as = a.impact * 0.55 + a.novelty * 0.45 + (a.origin === "desk" ? 4 : 0);
      const bs = b.impact * 0.55 + b.novelty * 0.45 + (b.origin === "desk" ? 4 : 0);
      return bs - as;
    });
    return combined;
  }, [wire, filter]);

  return (
    <Shell>
      <p className="text-xs tracking-widest text-accent uppercase">Ingest</p>
      <h1 className="mt-3 font-display text-4xl text-fg md:text-5xl">The wire, plus the desk</h1>
      <p className="mt-4 max-w-3xl text-muted">
        Desk items stay pinned at a slight advantage so a keyword match cannot outrank a paper we actually read.
        Pull preprints when you want the morning stack. Nothing here calls a model.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="solid" onClick={() => void pull()} disabled={wire.state === "loading"}>
          {wire.state === "loading" ? "Pulling arXiv…" : wire.state === "ready" ? "Pull again" : "Pull recent preprints"}
        </Button>
        {wire.state === "ready" ? (
          <p className="text-sm text-muted">
            {wire.signals.length} preprints · {formatDay(wire.fetchedAt)}
            {wire.warnings.length ? ` · ${wire.warnings.length} feed warning` : ""}
          </p>
        ) : null}
      </div>
      {wire.state === "error" ? (
        <p className="mt-4 max-w-3xl text-sm text-fg">{wire.message} The desk items below are still here.</p>
      ) : null}
      {wire.state === "ready" && wire.warnings.length > 0 ? (
        <ul className="mt-3 text-sm text-muted">
          {wire.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "tap inline-flex min-h-11 shrink-0 items-center rounded-md border px-4 text-sm",
              filter === item.id ? "border-accent bg-raised text-fg" : "border-line text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {wire.state === "loading" ? (
          <p className="text-sm text-muted">Asking arXiv for the latest in five categories. This can take a few seconds.</p>
        ) : null}
        {rows.length === 0 ? (
          <p className="text-sm text-muted">Nothing in this slice. Try another domain, or pull the wire.</p>
        ) : (
          rows.map((signal) => <SignalCard key={signal.id} signal={signal} onOpen={setOpen} />)
        )}
      </div>
      <SignalDrawer signal={open} onClose={() => setOpen(null)} />
    </Shell>
  );
}

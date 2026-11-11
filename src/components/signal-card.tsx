import { ArrowUpRight } from "lucide-react";
import { DOMAIN_LABEL, type Signal } from "@/lib/types";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 flex-1">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-raised">
        <div className="h-1 rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function SignalCard({
  signal,
  onOpen,
  index,
}: {
  signal: Signal;
  onOpen: (signal: Signal) => void;
  index?: number;
}) {
  return (
    <article className="border-b border-line py-6 first:pt-0">
      <button
        type="button"
        onClick={() => onOpen(signal)}
        className="tap group w-full text-left"
      >
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-widest text-muted uppercase">
          {index !== undefined ? (
            <span className="tabular-nums text-accent">{String(index).padStart(2, "0")}</span>
          ) : null}
          <span>{DOMAIN_LABEL[signal.domain]}</span>
          <span aria-hidden>·</span>
          <span>{formatDay(signal.published)}</span>
          <span aria-hidden>·</span>
          <span className={cn(signal.origin === "desk" ? "text-fg" : "text-muted")}>
            {signal.origin === "desk" ? "Desk" : "arXiv wire"}
          </span>
        </div>
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg group-hover:text-accent md:text-3xl">
          {signal.title}
        </h2>
        <p className="mt-3 max-w-3xl text-base text-fg/90">{signal.whatChanged}</p>
      </button>
      <div className="mt-4 flex flex-wrap items-end gap-6">
        <ScoreBar label={signal.origin === "desk" ? "Novelty · desk" : "Novelty · wire"} value={signal.novelty} />
        <ScoreBar label={signal.origin === "desk" ? "Impact · desk" : "Impact · wire"} value={signal.impact} />
        <button
          type="button"
          onClick={() => onOpen(signal)}
          className="tap inline-flex min-h-11 items-center gap-1 text-sm text-accent"
        >
          Open the split
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}

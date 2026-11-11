import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { SignalCard } from "@/components/signal-card";
import { SignalDrawer } from "@/components/signal-drawer";
import { DESK, EDITION, PASSED } from "@/data/briefing";
import { DOMAIN_LABEL, type Signal } from "@/lib/types";
import { formatDay } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Home });

const LEADS = DESK.filter((s) => (s.editionRank ?? 99) <= 5);
const REST = DESK.filter((s) => (s.editionRank ?? 99) > 5);

function Home() {
  const [open, setOpen] = useState<Signal | null>(null);

  return (
    <Shell>
      <article>
        <p className="stagger text-xs tracking-widest text-accent uppercase">
          Edition {EDITION.id} · {formatDay(EDITION.date)}
        </p>
        <h1 className="stagger stagger-2 mt-3 max-w-4xl font-display text-4xl font-medium tracking-tight text-fg md:text-6xl">
          {EDITION.title}
        </h1>
        <p className="stagger stagger-3 mt-5 max-w-3xl text-lg text-muted">
          The desk this fortnight is not a model release. Three constraints got a little looser at once: how much
          an agent must remember, how close the bytes sit to the math, and how wide a bandgap we can still call
          a semiconductor. Ranked by what might change what is buildable. Volume is a down-rank.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Pitch
            kicker="01 · AI"
            text="A reported SWE-bench run held its score after throwing the trace away. If that survives contact with other scaffolds, peak context is a budget, not a fate."
          />
          <Pitch
            kicker="02 · Hardware"
            text="Qualcomm, OCP proposals, and an NVIDIA blog all describe a memory hierarchy past HBM. The measurements are mostly theirs. The bottleneck is not."
          />
          <Pitch
            kicker="03 · Materials"
            text="A film above 7 eV still conducts, and a gallium-oxide module has pulsed a megawatt. Neither is a power supply you can buy. Both move the ceiling."
          />
        </div>

        <div className="mt-12 border-t border-line pt-8">
          {LEADS.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              index={signal.editionRank}
              onOpen={setOpen}
            />
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl text-fg">Also on the desk</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {REST.map((signal) => (
              <li key={signal.id}>
                <button
                  type="button"
                  onClick={() => setOpen(signal)}
                  className="tap flex w-full flex-col gap-1 py-4 text-left md:flex-row md:items-baseline md:gap-4"
                >
                  <span className="shrink-0 text-xs tracking-widest text-muted uppercase md:w-36">
                    {DOMAIN_LABEL[signal.domain]}
                  </span>
                  <span className="text-fg">{signal.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-md border border-line bg-surface p-5">
          <h2 className="text-xs tracking-widest text-accent uppercase">Looked at, and passed</h2>
          {PASSED.map((item) => (
            <p key={item.title} className="mt-3 text-sm text-muted">
              <span className="text-fg">{item.title}. </span>
              {item.detail}{" "}
              <a href={item.url} className="text-accent underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                Source
              </a>
            </p>
          ))}
        </section>

        <details className="mt-8 border border-line bg-surface">
          <summary className="min-h-11 px-4 py-3 text-sm text-fg">How a signal gets onto this desk</summary>
          <div className="space-y-3 border-t border-line px-4 py-4 text-sm text-muted">
            <p>
              Edition items are chosen and split by hand into established, plausible, and speculation. Scores are
              judgment. They will be wrong in places. Where a number comes from a company, the card says so.
            </p>
            <p>
              The wire pulls recent arXiv preprints — cs.LG, cs.AI, architecture, materials, cosmology — and ranks
              them with a small keyword heuristic that down-ranks the words “revolutionary” and “survey.” It does
              not read the PDF.
            </p>
            <p>
              “Ask the engine” is the only model call, and only when you press it. Notes, tracked signals, and
              open questions stay in this browser. We don’t know yet is a complete sentence.
            </p>
            <p>
              <Link to="/feed" className="text-accent underline-offset-2 hover:underline">
                Open the wire
              </Link>
              {" · "}
              <Link to="/lab" search={{ focus: "context" }} className="text-accent underline-offset-2 hover:underline">
                Open the lab
              </Link>
            </p>
          </div>
        </details>
      </article>
      <SignalDrawer signal={open} onClose={() => setOpen(null)} />
    </Shell>
  );
}

function Pitch({ kicker, text }: { kicker: string; text: string }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="text-xs tracking-widest text-accent uppercase">{kicker}</p>
      <p className="mt-2 text-sm text-fg">{text}</p>
    </div>
  );
}

import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LabId } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { id: LabId; label: string; kicker: string }[] = [
  { id: "context", label: "Context tax", kicker: "Forgetting" },
  { id: "memory", label: "Memory wall", kicker: "Bytes" },
  { id: "bandgap", label: "Bandgap", kicker: "Materials" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-fg">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Range({
  min,
  max,
  step,
  value,
  onChange,
  suffix,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-accent"
      />
      <span className="w-24 shrink-0 text-right text-sm tabular-nums text-fg">
        {value}
        {suffix ?? ""}
      </span>
    </div>
  );
}

function ChartBox({ children }: { children: ReactNode }) {
  return <div className="h-64 w-full">{children}</div>;
}

const tipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  borderRadius: "0.5rem",
  color: "var(--color-fg)",
  fontSize: "0.8rem",
};

export function Labs({ focus }: { focus: LabId }) {
  return (
    <div>
      <p className="max-w-3xl text-muted">
        Three sketches. Each one is a calculator with the assumptions written on it. If a slider moves a number
        by a lot, the result was never a fact — it was that assumption.
      </p>
      <div className="mt-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Instruments">
        {TABS.map((tab) => (
          <a
            key={tab.id}
            href={`/lab?focus=${tab.id}`}
            role="tab"
            aria-selected={focus === tab.id}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-md border px-4 text-sm",
              focus === tab.id ? "border-accent bg-raised text-fg" : "border-line text-muted",
            )}
          >
            <span className="mr-2 text-xs tracking-widest text-accent uppercase">{tab.kicker}</span>
            {tab.label}
          </a>
        ))}
      </div>
      <div className="mt-8">
        {focus === "context" ? <ContextLab /> : null}
        {focus === "memory" ? <MemoryLab /> : null}
        {focus === "bandgap" ? <BandgapLab /> : null}
      </div>
    </div>
  );
}

function ContextLab() {
  const [steps, setSteps] = useState(40);
  const [tokens, setTokens] = useState(800);
  const [summary, setSummary] = useState(800);
  const [mode, setMode] = useState<"full" | "cap" | "each">("cap");
  const [capK, setCapK] = useState(8);

  const chart = useMemo(() => {
    const rows: { step: number; full: number; strategy: number }[] = [];
    let fullCtx = 0;
    let stratCtx = 0;
    let fullCost = 0;
    let stratCost = 0;
    const cap = capK * 1000;
    let peakStrat = 0;
    for (let step = 1; step <= steps; step += 1) {
      fullCost += tokens * Math.max(fullCtx, 1);
      fullCtx += tokens;
      if (mode === "each") {
        stratCost += tokens * summary;
        stratCtx = summary;
      } else if (mode === "cap") {
        if (stratCtx > cap) stratCtx = summary;
        stratCost += tokens * Math.max(stratCtx, 1);
        stratCtx += tokens;
        if (stratCtx > cap) stratCtx = summary;
      } else {
        stratCost += tokens * Math.max(stratCtx, 1);
        stratCtx += tokens;
      }
      peakStrat = Math.max(peakStrat, stratCtx);
      rows.push({
        step,
        full: Math.round(fullCost / 1_000_000),
        strategy: Math.round(stratCost / 1_000_000),
      });
    }
    const last = rows[rows.length - 1];
    const ratio = last && last.full > 0 ? last.strategy / last.full : 1;
    return {
      rows,
      ratio,
      peakFull: Math.max(1, Math.round((tokens * steps) / 1000)),
      peakStrat: Math.max(1, Math.round(peakStrat / 1000)),
    };
  }, [steps, tokens, summary, mode, capK]);

  return (
    <section>
      <h2 className="font-display text-3xl text-fg">What a summary costs you, and saves you</h2>
      <p className="mt-3 max-w-3xl text-sm text-muted">
        Sketch, not a profiler. Generating a step of T tokens while the context holds C earlier tokens is charged
        as T × C — the usual attention-shaped bill, where every new token looks back. “Full” never forgets. “Cap”
        snaps the history down to the summary once the cap would break. “Each step” keeps only the summary.
      </p>
      <div className="mt-4 rounded-md border border-line bg-surface p-4 text-sm text-fg">
        Reported, second-hand, for Claude Opus 4.5 on SWE-bench Verified: one action per context scored 70.2
        against 70.0 with the full history, and median peak context fell from 32K to 8K. Best compaction setting
        in that writeup: 74.8. Source is a DAIR.AI roundup of NVIDIA work (8 Nov 2026), not a paper re-read here.
        One benchmark. One model. Your task may not forgive the same cut.
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field label="Agent steps" hint="How long the job runs.">
          <Range min={8} max={120} step={1} value={steps} onChange={setSteps} />
        </Field>
        <Field label="New tokens per step" hint="Tool output plus the reply.">
          <Range min={200} max={4000} step={50} value={tokens} onChange={setTokens} />
        </Field>
        <Field label="Summary kept" hint="Tokens you refuse to throw away.">
          <Range min={200} max={4000} step={50} value={summary} onChange={setSummary} suffix=" tok" />
        </Field>
        <Field label="Cap, if you use one" hint="Thousands of tokens.">
          <Range min={2} max={64} step={1} value={capK} onChange={setCapK} suffix="k" />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Strategy">
        {(
          [
            ["full", "Full history"],
            ["cap", "Compact at cap"],
            ["each", "Summary every step"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "tap min-h-11 rounded-md border px-4 text-sm",
              mode === id ? "border-accent bg-raised text-fg" : "border-line text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Relative bill" value={`${Math.round(chart.ratio * 100)}%`} hint="Strategy vs full history" />
        <Stat label="Peak, full" value={`${chart.peakFull}k`} hint="Tokens of history" />
        <Stat label="Peak, strategy" value={`${chart.peakStrat}k`} hint="Sketch of the high-water mark" />
      </div>
      <div className="mt-6 rounded-md border border-line bg-surface p-4">
        <ChartBox>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.rows}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="step" stroke="var(--color-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} width={48} />
              <Tooltip contentStyle={tipStyle} />
              <Line type="monotone" dataKey="full" name="Full" stroke="var(--color-muted)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="strategy" name="Strategy" stroke="var(--color-accent)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
        <p className="mt-2 text-xs text-muted">Cumulative relative cost, millions of token-lookbacks. Axis is a sketch unit.</p>
      </div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="text-xs tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

const CAP_PRESETS = [
  { id: "80", label: "80 GB", gb: 80, note: "A smaller accelerator. Sketch." },
  { id: "192", label: "192 GB", gb: 192, note: "One high-capacity HBM GPU, order of magnitude." },
  { id: "3200", label: "3.2 TB", gb: 3200, note: "OCP-coverage figure for an LPDDR5X module proposal (Nov 2026). A proposal." },
];

const BW_PRESETS = [
  { id: "lpddr", label: "0.5 TB/s", tbps: 0.5, note: "Board LPDDR-class. Sketch, not a datasheet." },
  { id: "hbm", label: "8 TB/s", tbps: 8, note: "HBM-class accelerator. Order of magnitude." },
  { id: "fast", label: "16 TB/s", tbps: 16, note: "A faster HBM-class sketch. Still a sketch." },
];

function MemoryLab() {
  const [paramsB, setParamsB] = useState(32);
  const [bytes, setBytes] = useState(0.5);
  const [contextK, setContextK] = useState(32);
  const [kv, setKv] = useState(80);
  const [capId, setCapId] = useState("192");
  const [bwId, setBwId] = useState("hbm");

  const cap = CAP_PRESETS.find((p) => p.id === capId) ?? CAP_PRESETS[1];
  const bw = BW_PRESETS.find((p) => p.id === bwId) ?? BW_PRESETS[1];

  const weights = paramsB * bytes;
  const kvGb = (contextK / 1024) * kv;
  const used = weights + kvGb;
  const fit = used <= cap.gb;
  const bytesPerToken = weights * 1e9 + kvGb * 1e9;
  const tokS = bytesPerToken > 0 ? (bw.tbps * 1e12) / bytesPerToken : 0;
  const pct = Math.min(100, (used / cap.gb) * 100);

  return (
    <section>
      <h2 className="font-display text-3xl text-fg">Do the weights and the cache fit?</h2>
      <p className="mt-3 max-w-3xl text-sm text-muted">
        Batch-1 decode, the pessimistic version: every new token rereads all weights and the whole KV cache.
        Real engines cache weights in SRAM slices and batch to amortize them. Use this to see which knob breaks
        the box, not to quote a tok/s.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field label="Active parameters" hint="Billions awake per token, not the total shelf.">
          <Range min={4} max={400} step={1} value={paramsB} onChange={setParamsB} suffix=" B" />
        </Field>
        <Field label="Bytes per parameter" hint="0.5 is FP4-class, 1 is FP8, 2 is FP16.">
          <Range min={0.5} max={2} step={0.5} value={bytes} onChange={setBytes} />
        </Field>
        <Field label="Context" hint="Thousands of tokens.">
          <Range min={4} max={256} step={4} value={contextK} onChange={setContextK} suffix="k" />
        </Field>
        <Field label="KV cache" hint="Megabytes per 1k tokens. Architecture-dependent; 80 is a middle sketch.">
          <Range min={10} max={400} step={5} value={kv} onChange={setKv} suffix=" MB" />
        </Field>
      </div>
      <div className="mt-4">
        <p className="text-sm text-fg">Capacity preset</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CAP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setCapId(preset.id)}
              className={cn(
                "tap min-h-11 rounded-md border px-4 text-sm",
                capId === preset.id ? "border-accent bg-raised text-fg" : "border-line text-muted",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{cap.note}</p>
      </div>
      <div className="mt-4">
        <p className="text-sm text-fg">Bandwidth preset</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setBwId(preset.id)}
              className={cn(
                "tap min-h-11 rounded-md border px-4 text-sm",
                bwId === preset.id ? "border-accent bg-raised text-fg" : "border-line text-muted",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{bw.note}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Weights" value={`${weights.toFixed(1)} GB`} hint={`${paramsB}B × ${bytes} B`} />
        <Stat label="KV cache" value={`${kvGb.toFixed(1)} GB`} hint={`${contextK}k context`} />
        <Stat label={fit ? "Fits" : "Does not fit"} value={`${used.toFixed(1)} GB`} hint={`of ${cap.gb} GB`} />
      </div>
      <div className="mt-4 h-2 rounded-full bg-raised">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-4 text-sm text-fg">
        Pessimistic batch-1 decode on this bandwidth:{" "}
        <span className="tabular-nums font-medium">{tokS >= 10 ? Math.round(tokS) : tokS.toFixed(1)}</span> tokens/s.
        Double the context and the cache term doubles; the weights do not. Qualcomm’s 18× versus LPDDR5X and NVIDIA’s
        30× throughput-per-dollar are not plugged in here — those are their claims, and this box would only hide the assumption.
      </p>
    </section>
  );
}

const MATERIALS = [
  { name: "Silicon", tick: "Si", eg: 1.12, mu: 1, note: "Reference. Bandgap established. Mobility ratio set to 1." },
  { name: "4H-SiC", tick: "SiC", eg: 3.26, mu: 0.7, note: "Bandgap established. Mobility ratio is a sketch." },
  { name: "GaN", tick: "GaN", eg: 3.4, mu: 0.9, note: "Bandgap established. Mobility ratio is a sketch." },
  { name: "β-Ga2O3", tick: "Ga2O3", eg: 4.8, mu: 0.3, note: "Gap is real, roughly 4.5–4.9 eV. Mobility here is a pessimistic sketch." },
];

function BandgapLab() {
  const [exponent, setExponent] = useState(2);
  const [cornellMu, setCornellMu] = useState(15);

  const rows = useMemo(() => {
    const points = [
      ...MATERIALS,
      {
        name: "Cornell AlGaO",
        tick: "AlGaO",
        eg: 7,
        mu: cornellMu / 100,
        note: "Gap above 7 eV is the Oct 2026 Nature result. Mobility is not published in what we read — this marker is your guess.",
      },
    ];
    return points.map((point) => {
      const ecRatio = (point.eg / 1.12) ** exponent;
      const bfom = point.mu * ecRatio ** 3;
      return {
        name: point.name,
        tick: point.tick,
        orders: Math.log10(Math.max(bfom, 1e-6)),
        bfom,
        note: point.note,
        eg: point.eg,
        mu: point.mu,
      };
    });
  }, [exponent, cornellMu]);

  return (
    <section>
      <h2 className="font-display text-3xl text-fg">A wider gap is not a free device</h2>
      <p className="mt-3 max-w-3xl text-sm text-muted">
        Baliga’s figure of merit for a unipolar power switch scales like mobility times breakdown-field cubed.
        A common empirical sketch sets breakdown field proportional to bandgap to the power n. Default n is 2.
        This is not a score for GPU transistors, and it ignores contact resistance, which is where wide-gap
        devices often go to die.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field label="Exponent n" hint="Ec ∝ Eg^n. Try 1.5 and 2.5. Watch the Cornell bar move more than silicon.">
          <Range min={1.5} max={2.5} step={0.1} value={exponent} onChange={setExponent} />
        </Field>
        <Field label="Cornell mobility guess" hint="Percent of silicon’s mobility. Unknown. Default is a skeptical 15%.">
          <Range min={1} max={100} step={1} value={cornellMu} onChange={setCornellMu} suffix="%" />
        </Field>
      </div>
      <div className="mt-6 rounded-md border border-line bg-surface p-4">
        <ChartBox>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="tick" stroke="var(--color-muted)" fontSize={12} tickLine={false} interval={0} />
              <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} width={36} />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="orders" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
        <p className="mt-2 text-xs text-muted">
          Vertical axis is log10 of the figure of merit relative to silicon. A bar of 2 means about 100×, not 2×.
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li key={row.name} className="text-sm text-muted">
            <span className="text-fg">{row.name}</span>
            {` · ${row.eg} eV · mobility ×${row.mu.toFixed(2)} · ~${row.bfom >= 100 ? Math.round(row.bfom).toLocaleString("en-US") : row.bfom.toFixed(1)}× silicon. ${row.note}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

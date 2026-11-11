import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/signal-card";
import { imagineFromSignal } from "@/lib/explore.functions";
import { useMemory } from "@/lib/memory-store";
import { DOMAIN_LABEL, LAB_LABEL, type ClaimLevel, type Signal } from "@/lib/types";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

function imagineKey(id: string, ask: string) {
  return `${id}::${ask.trim().toLowerCase()}`;
}

function factsFor(signal: Signal) {
  const lines = [
    `What changed: ${signal.whatChanged}`,
    `Why it might matter: ${signal.whyItMatters}`,
    "ESTABLISHED:",
    ...signal.established.map((line) => `- ${line}`),
    "PLAUSIBLE (do not treat as fact):",
    ...(signal.plausible.length ? signal.plausible.map((line) => `- ${line}`) : ["- none listed"]),
    "SPECULATION (do not treat as fact):",
    ...(signal.speculation.length ? signal.speculation.map((line) => `- ${line}`) : ["- none listed"]),
  ];
  return lines.join("\n");
}

function ClaimList({
  level,
  items,
}: {
  level: ClaimLevel;
  items: string[];
}) {
  if (items.length === 0) return null;
  const label =
    level === "established" ? "Established" : level === "plausible" ? "Plausible" : "Speculation";
  return (
    <section className="mt-6">
      <h3 className="text-xs tracking-widest text-accent uppercase">{label}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="border-l border-line pl-3 text-sm text-fg">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SignalDrawer({
  signal,
  onClose,
}: {
  signal: Signal | null;
  onClose: () => void;
}) {
  const hydrated = useMemory((s) => s.hydrated);
  const tracked = useMemory((s) => (signal ? s.tracked[signal.id] : undefined));
  const note = useMemory((s) => (signal ? (s.notes[signal.id] ?? "") : ""));
  const toggleTrack = useMemory((s) => s.toggleTrack);
  const setNote = useMemory((s) => s.setNote);
  const saveImagine = useMemory((s) => s.saveImagine);
  const imagines = useMemory((s) => s.imagines);
  const [ask, setAsk] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = signal ? imagineKey(signal.id, ask) : "";
  const saved = key ? imagines[key] : undefined;

  async function pressureTest() {
    if (!signal || pending) return;
    setPending(true);
    setError(null);
    const result = await imagineFromSignal({
      data: {
        signalId: signal.id,
        title: signal.title,
        facts: factsFor(signal),
        ask,
      },
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const parsed = result.parsed;
    saveImagine(imagineKey(signal.id, ask), {
      at: new Date().toISOString(),
      ask,
      reading: parsed?.reading ?? "",
      whereWeMightBeWrong: parsed?.whereWeMightBeWrong ?? "",
      pathways: parsed?.pathways ?? [],
      questions: parsed?.questions ?? [],
      raw: parsed ? null : result.text,
    });
  }

  return (
    <Dialog.Root open={signal !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/75" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-line bg-surface outline-none">
          {signal ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <Dialog.Description className="text-xs tracking-widest text-muted uppercase">
                    {DOMAIN_LABEL[signal.domain]} · {formatDay(signal.published)} ·{" "}
                    {signal.origin === "desk" ? "Desk" : "arXiv"}
                  </Dialog.Description>
                  <Dialog.Title className="mt-2 font-display text-2xl font-medium text-fg">
                    {signal.title}
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" quiet aria-label="Close" className="shrink-0 px-3">
                    <X className="size-4" />
                  </Button>
                </Dialog.Close>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="flex gap-6">
                  <ScoreBar
                    label={signal.origin === "desk" ? "Novelty · desk" : "Novelty · wire"}
                    value={signal.novelty}
                  />
                  <ScoreBar
                    label={signal.origin === "desk" ? "Impact · desk" : "Impact · wire"}
                    value={signal.impact}
                  />
                </div>
                {signal.wireNote ? <p className="mt-3 text-xs text-muted">{signal.wireNote}</p> : null}
                <p className="mt-5 text-sm text-muted">
                  Desk scores are editorial judgment. They are not measurements. Nothing below is a final answer.
                </p>
                <p className="mt-4 text-base text-fg">{signal.whyItMatters}</p>
                <ClaimList level="established" items={signal.established} />
                <ClaimList level="plausible" items={signal.plausible} />
                <ClaimList level="speculation" items={signal.speculation} />

                {signal.pathways.length > 0 ? (
                  <section className="mt-6">
                    <h3 className="text-xs tracking-widest text-accent uppercase">What becomes possible</h3>
                    <ul className="mt-3 space-y-3">
                      {signal.pathways.map((path) => (
                        <li key={path.title} className="rounded-md border border-line bg-bg p-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-medium text-fg">{path.title}</p>
                            <span className="text-xs tracking-widest text-muted uppercase">{path.level}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted">{path.detail}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {signal.questions.length > 0 ? (
                  <section className="mt-6">
                    <h3 className="text-xs tracking-widest text-accent uppercase">Open questions</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-fg">
                      {signal.questions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section className="mt-6">
                  <h3 className="text-xs tracking-widest text-accent uppercase">Sources</h3>
                  <ul className="mt-2 space-y-2">
                    {signal.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-accent underline-offset-2 hover:underline"
                        >
                          {source.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-8 border-t border-line pt-6">
                  <h3 className="font-display text-xl text-fg">Pressure-test</h3>
                  <p className="mt-2 text-sm text-muted">
                    One call, when you ask. The model only sees the split above. It is told not to invent citations.
                    If it does anyway, that sentence is speculation wearing a costume.
                  </p>
                  <label className="mt-3 block text-sm text-muted" htmlFor="ask">
                    Optional question
                  </label>
                  <textarea
                    id="ask"
                    value={ask}
                    onChange={(e) => setAsk(e.target.value.slice(0, 400))}
                    rows={3}
                    placeholder="What would have to be true for this to change a lab’s next build?"
                    className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  />
                  <Button className="mt-3" variant="solid" onClick={() => void pressureTest()} disabled={pending}>
                    {pending ? "Thinking…" : "Ask the engine"}
                  </Button>
                  {error ? <p className="mt-3 text-sm text-fg">{error}</p> : null}
                  {saved ? (
                    <div className="mt-4 rounded-md border border-line bg-bg p-3">
                      {saved.reading ? <p className="text-sm text-fg">{saved.reading}</p> : null}
                      {saved.whereWeMightBeWrong ? (
                        <p className="mt-3 text-sm text-muted">
                          <span className="text-accent">Where this is weak. </span>
                          {saved.whereWeMightBeWrong}
                        </p>
                      ) : null}
                      {saved.pathways.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {saved.pathways.map((path) => (
                            <li key={path.title} className="text-sm">
                              <span className="text-fg">{path.title}. </span>
                              <span className="text-xs tracking-widest text-muted uppercase">{path.level}. </span>
                              <span className="text-muted">{path.detail}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {saved.questions.length > 0 ? (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg">
                          {saved.questions.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      ) : null}
                      {saved.raw ? (
                        <p className="mt-3 text-sm text-muted whitespace-pre-wrap">
                          Unstructured note — the model left the format. {saved.raw}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <section className="mt-8 border-t border-line pt-6">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={hydrated && tracked ? "solid" : "line"}
                      onClick={() => toggleTrack(signal)}
                    >
                      {hydrated && tracked ? "Tracking" : "Track this"}
                    </Button>
                    {signal.lab ? (
                      <Link
                        to="/lab"
                        search={{ focus: signal.lab }}
                        className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm text-fg hover:border-accent"
                        onClick={onClose}
                      >
                        Open {LAB_LABEL[signal.lab]}
                      </Link>
                    ) : null}
                  </div>
                  <label className="mt-4 block text-sm text-muted" htmlFor="note">
                    Note, kept on this device
                  </label>
                  <textarea
                    id="note"
                    value={hydrated ? note : ""}
                    onChange={(e) => setNote(signal.id, e.target.value)}
                    rows={4}
                    className={cn(
                      "mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                    )}
                    placeholder="What you want to remember, or what you don’t buy."
                  />
                </section>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

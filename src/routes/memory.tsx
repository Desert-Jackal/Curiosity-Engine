import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { SignalDrawer } from "@/components/signal-drawer";
import { useMemory } from "@/lib/memory-store";
import { DOMAIN_LABEL, type Domain, type Signal } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/memory")({ component: MemoryPage });

const DOMAINS: Domain[] = ["ai", "hardware", "materials", "physics", "wildcard"];

function MemoryPage() {
  const hydrated = useMemory((s) => s.hydrated);
  const questions = useMemory((s) => s.questions);
  const tracked = useMemory((s) => s.tracked);
  const journal = useMemory((s) => s.journal);
  const notes = useMemory((s) => s.notes);
  const addQuestion = useMemory((s) => s.addQuestion);
  const removeQuestion = useMemory((s) => s.removeQuestion);
  const setJournal = useMemory((s) => s.setJournal);
  const [text, setText] = useState("");
  const [domain, setDomain] = useState<Domain>("ai");
  const [open, setOpen] = useState<Signal | null>(null);

  const trackedList = Object.values(tracked);
  const noted = Object.entries(notes).filter(([, value]) => value.trim().length > 0);

  return (
    <Shell>
      <p className="text-xs tracking-widest text-accent uppercase">Living memory</p>
      <h1 className="mt-3 font-display text-4xl text-fg md:text-5xl">Questions we have not closed</h1>
      <p className="mt-4 max-w-3xl text-muted">
        Stored in this browser only. Clear the site data and the desk forgets you, which is the correct failure
        mode for a v0.1 with no account.
      </p>

      {!hydrated ? <p className="mt-6 text-sm text-muted">Opening the notebook…</p> : null}

      <section className="mt-8">
        <h2 className="font-display text-2xl text-fg">Open questions</h2>
        <form
          className="mt-4 flex flex-col gap-3 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = text.trim();
            if (!trimmed) return;
            addQuestion({ text: trimmed, domain });
            setText("");
          }}
        >
          <label className="sr-only" htmlFor="q">
            New question
          </label>
          <input
            id="q"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What would change your mind?"
            className="min-h-11 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          />
          <label className="sr-only" htmlFor="qd">
            Domain
          </label>
          <select
            id="qd"
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain)}
            className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm text-fg"
          >
            {DOMAINS.map((item) => (
              <option key={item} value={item}>
                {DOMAIN_LABEL[item]}
              </option>
            ))}
          </select>
          <Button type="submit" variant="solid">
            Add
          </Button>
        </form>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {questions.map((q) => (
            <li key={q.id} className="flex items-start gap-3 py-3">
              <div className="flex-1">
                <p className="text-xs tracking-widest text-accent uppercase">{DOMAIN_LABEL[q.domain]}</p>
                <p className="mt-1 text-fg">{q.text}</p>
              </div>
              <Button variant="ghost" className="px-3" onClick={() => removeQuestion(q.id)}>
                Drop
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-fg">Tracked</h2>
        {trackedList.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing pinned. Open a signal and track it.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {trackedList.map((signal) => (
              <li key={signal.id}>
                <button type="button" className="tap w-full py-3 text-left" onClick={() => setOpen(signal)}>
                  <span className="text-xs tracking-widest text-muted uppercase">
                    {DOMAIN_LABEL[signal.domain]}
                  </span>
                  <span className="mt-1 block text-fg">{signal.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-fg">Notes</h2>
        {noted.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Notes live on the signal you wrote them on.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {noted.map(([id, value]) => (
              <li key={id} className={cn("rounded-md border border-line bg-surface p-4")}>
                <p className="text-xs text-muted">{tracked[id]?.title ?? id}</p>
                <p className="mt-2 text-sm whitespace-pre-wrap text-fg">{value}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-fg">Field notebook</h2>
        <p className="mt-2 text-sm text-muted">A scratch page. Not a conclusion.</p>
        <textarea
          value={hydrated ? journal : ""}
          onChange={(e) => setJournal(e.target.value)}
          rows={8}
          className="mt-3 w-full rounded-md border border-line bg-surface px-3 py-3 text-sm text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          placeholder="Loose threads, things to re-read, bets you would not publish."
        />
      </section>
      <SignalDrawer signal={open} onClose={() => setOpen(null)} />
    </Shell>
  );
}

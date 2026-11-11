import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, Bookmark, FlaskConical, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemory } from "@/lib/memory-store";

const LINKS = [
  { to: "/", label: "Briefing", icon: BookOpen },
  { to: "/feed", label: "Wire", icon: Radio },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/memory", label: "Memory", icon: Bookmark },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hydrated = useMemory((s) => s.hydrated);
  const questionCount = useMemory((s) => s.questions.length);

  useEffect(() => {
    const api = useMemory.persist;
    if (!api) {
      useMemory.setState({ hydrated: true });
      return;
    }
    void Promise.resolve(api.rehydrate()).then(() => {
      useMemory.setState({ hydrated: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-8">
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <span
              className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-accent"
              aria-hidden
            >
              <span className="h-px w-5 bg-accent/70" />
              <span className="absolute size-1.5 rounded-full bg-accent" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-medium tracking-tight text-fg">
                Curiosity Engine
              </span>
              <span className="block text-xs tracking-widest text-muted uppercase">Universe · v0.1</span>
            </span>
          </Link>
          <nav className="flex max-w-full items-center gap-1 overflow-x-auto sm:ml-auto" aria-label="Sections">
            {LINKS.map((link) => {
              const on = path === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition-colors duration-200",
                    on ? "bg-raised text-fg" : "text-muted hover:text-fg",
                  )}
                  aria-current={on ? "page" : undefined}
                >
                  <Icon className="size-4" aria-hidden />
                  {link.label}
                  {link.to === "/memory" && hydrated ? (
                    <span className="tabular-nums text-xs text-accent">{questionCount}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">{children}</main>
    </div>
  );
}

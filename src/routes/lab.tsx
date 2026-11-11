import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Labs } from "@/components/labs";
import type { LabId } from "@/lib/types";

export const Route = createFileRoute("/lab")({
  validateSearch: (search: Record<string, unknown>) => {
    const focus = search.focus;
    const safe: LabId =
      focus === "memory" || focus === "bandgap" || focus === "context" ? focus : "context";
    return { focus: safe };
  },
  component: LabPage,
});

function LabPage() {
  const { focus } = Route.useSearch();
  return (
    <Shell>
      <p className="text-xs tracking-widest text-accent uppercase">Instruments</p>
      <h1 className="mt-3 font-display text-4xl text-fg md:text-5xl">Pressure, before poetry</h1>
      <div className="mt-6">
        <Labs focus={focus} />
      </div>
    </Shell>
  );
}

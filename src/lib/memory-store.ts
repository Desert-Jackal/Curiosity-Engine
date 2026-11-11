import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Domain, ImagineRecord, Signal } from "@/lib/types";

export type Question = {
  id: string;
  text: string;
  domain: Domain;
  signalId?: string;
};

type MemoryState = {
  hydrated: boolean;
  tracked: Record<string, Signal>;
  notes: Record<string, string>;
  questions: Question[];
  journal: string;
  imagines: Record<string, ImagineRecord>;
  setHydrated: () => void;
  toggleTrack: (signal: Signal) => void;
  setNote: (id: string, text: string) => void;
  addQuestion: (q: Omit<Question, "id">) => void;
  removeQuestion: (id: string) => void;
  setJournal: (text: string) => void;
  saveImagine: (key: string, record: ImagineRecord) => void;
};

const SEED: Question[] = [
  {
    id: "q-compact",
    text: "When compaction keeps a benchmark score, which failures did the summary delete?",
    domain: "ai",
    signalId: "sig-compaction",
  },
  {
    id: "q-hbc",
    text: "If near-memory compute wins on bandwidth per watt, which workloads stay on HBM because of latency?",
    domain: "hardware",
    signalId: "sig-memory-wall",
  },
  {
    id: "q-gap",
    text: "Can a gap past 7 eV be contacted well enough that the Baliga gain survives the package?",
    domain: "materials",
    signalId: "sig-cornell",
  },
  {
    id: "q-muon",
    text: "Is Muon a 2026 recipe that holds at the next scale, or a run that got lucky with clipping?",
    domain: "ai",
    signalId: "sig-arch-map",
  },
];

export const useMemory = create<MemoryState>()(
  persist(
    (set) => ({
      hydrated: false,
      tracked: {},
      notes: {},
      questions: SEED,
      journal: "",
      imagines: {},
      setHydrated: () => set({ hydrated: true }),
      toggleTrack: (signal) =>
        set((s) => {
          const tracked = { ...s.tracked };
          if (tracked[signal.id]) delete tracked[signal.id];
          else tracked[signal.id] = signal;
          return { tracked };
        }),
      setNote: (id, text) => set((s) => ({ notes: { ...s.notes, [id]: text } })),
      addQuestion: (q) =>
        set((s) => ({
          questions: [{ ...q, id: `q-${Date.now()}` }, ...s.questions],
        })),
      removeQuestion: (id) => set((s) => ({ questions: s.questions.filter((q) => q.id !== id) })),
      setJournal: (journal) => set({ journal }),
      saveImagine: (key, record) => set((s) => ({ imagines: { ...s.imagines, [key]: record } })),
    }),
    {
      name: "uce-memory-v1",
      skipHydration: true,
      partialize: (s) => ({
        tracked: s.tracked,
        notes: s.notes,
        questions: s.questions,
        journal: s.journal,
        imagines: s.imagines,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function useHydrateMemory() {
  const hydrated = useMemory((s) => s.hydrated);
  return hydrated;
}

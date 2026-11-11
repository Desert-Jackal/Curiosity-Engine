import { createServerFn } from "@tanstack/react-start";
import type { ImagineParsed, ImaginePathway } from "@/lib/types";

type Input = {
  signalId: string;
  title: string;
  facts: string;
  ask: string;
};

function asPathway(value: unknown): ImaginePathway | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const detail = typeof row.detail === "string" ? row.detail.trim() : "";
  const level = typeof row.level === "string" ? row.level.trim() : "speculation";
  if (!title || !detail) return null;
  return { title: title.slice(0, 160), detail: detail.slice(0, 600), level: level.slice(0, 40) };
}

function parseImagine(text: string): ImagineParsed | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const json = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    const reading = typeof json.reading === "string" ? json.reading.trim() : "";
    const whereWeMightBeWrong =
      typeof json.whereWeMightBeWrong === "string" ? json.whereWeMightBeWrong.trim() : "";
    const pathways = Array.isArray(json.pathways)
      ? json.pathways.map(asPathway).filter((p): p is ImaginePathway => p !== null).slice(0, 4)
      : [];
    const questions = Array.isArray(json.questions)
      ? json.questions.filter((q): q is string => typeof q === "string" && q.trim().length > 0).slice(0, 4)
      : [];
    if (!reading) return null;
    return { reading, whereWeMightBeWrong, pathways, questions };
  } catch {
    return null;
  }
}

export const imagineFromSignal = createServerFn({ method: "POST" })
  .validator((input: Input) => input)
  .handler(async ({ data }) => {
    const title = String(data?.title ?? "").slice(0, 300);
    const facts = String(data?.facts ?? "").slice(0, 4500);
    const ask = String(data?.ask ?? "").slice(0, 400);
    const signalId = String(data?.signalId ?? "").slice(0, 80);
    if (!title || !facts) return { ok: false as const, error: "Nothing to pressure-test." };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false as const,
        error: "The model is not available in this environment. The desk notes above still stand.",
      };
    }

    const user = [
      `Signal id: ${signalId}`,
      `Title: ${title}`,
      "",
      "Facts already separated by the desk. Do not upgrade a lower tier. Do not invent numbers or papers.",
      facts,
      ask ? `\nThe reader asks: ${ask}` : "",
    ].join("\n");

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.4,
          max_tokens: 700,
          messages: [
            {
              role: "system",
              content:
                "You are the Universe Curiosity Engine. Curious, precise, non-hype, occasionally dry. You never pretend to have a final answer. Say when we do not know. Return ONLY JSON with keys reading (string), whereWeMightBeWrong (string), pathways (array of {title, level, detail} where level is plausible or speculation — exactly 3), questions (array of 2 strings). No markdown.",
            },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(40_000),
      });
      if (!res.ok) {
        return { ok: false as const, error: `The model call failed (${res.status}). Nothing was saved.` };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) return { ok: false as const, error: "The model returned an empty note." };
      const parsed = parseImagine(text);
      return { ok: true as const, text, parsed };
    } catch {
      return { ok: false as const, error: "The model call did not finish. Try once more; we will not retry for you." };
    }
  });

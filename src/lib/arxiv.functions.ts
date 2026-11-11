import { createServerFn } from "@tanstack/react-start";
import { clamp } from "@/lib/format";
import type { Domain, Signal } from "@/lib/types";

const QUERIES: { q: string; label: string }[] = [
  { q: "cat:cs.LG", label: "cs.LG" },
  { q: "cat:cs.AI", label: "cs.AI" },
  { q: "cat:cs.AR OR cat:cs.ET", label: "cs.AR / cs.ET" },
  { q: "cat:cond-mat.mtrl-sci", label: "cond-mat.mtrl-sci" },
  { q: "cat:astro-ph.CO OR cat:astro-ph.HE OR cat:gr-qc", label: "astro-ph / gr-qc" },
];

function decode(raw: string) {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function field(entry: string, name: string) {
  const m = entry.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
}

function domainFromCat(cat: string): Domain {
  if (/^cs\.(AR|ET|DC|OS|PF)/.test(cat)) return "hardware";
  if (/^cond-mat/.test(cat)) return "materials";
  if (/^(astro-ph|gr-qc|hep-|physics|quant-ph)/.test(cat)) return "physics";
  if (/^(q-bio|eess|nlin)/.test(cat)) return "wildcard";
  return "ai";
}

const RULES: { re: RegExp; novelty: number; impact: number }[] = [
  { re: /muon|orthogonaliz|qk-?clip/i, novelty: 16, impact: 10 },
  { re: /linear attention|delta\s*net|gated delta|state[- ]space model/i, novelty: 14, impact: 9 },
  { re: /mixture[- ]of[- ]experts|\bmoe\b/i, novelty: 10, impact: 8 },
  { re: /compact(ion|ed)|context management/i, novelty: 14, impact: 11 },
  { re: /interconnect|co-packaged|\bhbm\b|near-memory|processing-in-memory/i, novelty: 14, impact: 12 },
  { re: /bandgap|gallium oxide|power semiconductor|thermal conductivity/i, novelty: 12, impact: 10 },
  { re: /reason(ing|er)|post-training|reinforcement learning/i, novelty: 7, impact: 7 },
  { re: /hubble|dark matter|gravitational wave|superconduct/i, novelty: 10, impact: 8 },
  { re: /survey|a review of|tutorial/i, novelty: -14, impact: -6 },
  { re: /revolutionary|groundbreaking|unprecedented|game[- ]changing/i, novelty: -10, impact: -8 },
];

function score(title: string, summary: string, published: string) {
  const text = `${title} ${summary}`;
  let novelty = 28;
  let impact = 26;
  for (const rule of RULES) {
    if (rule.re.test(text)) {
      novelty += rule.novelty;
      impact += rule.impact;
    }
  }
  const ageDays = (Date.now() - Date.parse(published)) / 86_400_000;
  if (ageDays < 10) {
    novelty += 16;
    impact += 8;
  } else if (ageDays < 30) {
    novelty += 10;
    impact += 5;
  } else if (ageDays < 90) {
    novelty += 4;
  } else {
    novelty -= 6;
  }
  return { novelty: clamp(Math.round(novelty), 8, 96), impact: clamp(Math.round(impact), 8, 96) };
}

function parseFeed(xml: string): Signal[] {
  return xml
    .split("<entry>")
    .slice(1)
    .map((entry) => {
      const idUrl = field(entry, "id");
      const abs = idUrl.match(/(\d{4}\.\d{4,5})/)?.[1];
      if (!abs) return null;
      const title = field(entry, "title");
      const summary = field(entry, "summary");
      const published = field(entry, "published") || field(entry, "updated");
      const cat =
        entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/)?.[1] ||
        entry.match(/<category[^>]*term="([^"]+)"/)?.[1] ||
        "";
      const authors = [...entry.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => decode(m[1]));
      const authorLine = authors.slice(0, 4).join(", ");
      const { novelty, impact } = score(title, summary, published);
      const blurb = summary.length > 420 ? `${summary.slice(0, 400).replace(/\s+\S*$/, "")}…` : summary;
      const signal: Signal = {
        id: `arxiv:${abs}`,
        title,
        domain: domainFromCat(cat),
        published: published.slice(0, 10),
        origin: "arxiv",
        novelty,
        impact,
        whatChanged: blurb,
        whyItMatters:
          "Pulled from the arXiv wire and ranked by a keyword heuristic plus recency. That is a lead, not a judgment. The abstract has not been checked against the PDF.",
        established: [
          `Preprint ${abs} (${cat || "uncategorized"}), posted ${published.slice(0, 10)}${authorLine ? ` — ${authorLine}` : ""}. Abstract only.`,
        ],
        plausible: [],
        speculation: [],
        pathways: [],
        questions: ["What was measured, against which baseline, and what would falsify it?"],
        sources: [{ name: `arXiv ${abs}`, url: `https://arxiv.org/abs/${abs}` }],
        wireNote: "Wire score is a heuristic. Hype words are down-ranked on purpose.",
      };
      return signal;
    })
    .filter((s): s is Signal => s !== null);
}

export const fetchArxiv = createServerFn({ method: "GET" }).handler(async () => {
  const warnings: string[] = [];
  const batches = await Promise.all(
    QUERIES.map(async (query) => {
      const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query.q)}&start=0&max_results=8&sortBy=submittedDate&sortOrder=descending`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "UniverseCuriosityEngine/0.1 (personal research sandbox; mailto:local)",
          },
          signal: AbortSignal.timeout(14_000),
        });
        if (!res.ok) {
          warnings.push(`${query.label}: arXiv returned ${res.status}.`);
          return [] as Signal[];
        }
        return parseFeed(await res.text());
      } catch {
        warnings.push(`${query.label}: the wire did not answer in time.`);
        return [] as Signal[];
      }
    }),
  );

  const seen = new Set<string>();
  const merged: Signal[] = [];
  for (const signal of batches.flat()) {
    if (seen.has(signal.id)) continue;
    seen.add(signal.id);
    merged.push(signal);
  }
  merged.sort((a, b) => b.impact * 0.55 + b.novelty * 0.45 - (a.impact * 0.55 + a.novelty * 0.45));

  if (merged.length === 0) {
    return {
      ok: false as const,
      error: warnings[0] ?? "arXiv returned nothing.",
      warnings,
    };
  }

  return {
    ok: true as const,
    fetchedAt: new Date().toISOString(),
    signals: merged.slice(0, 24),
    warnings,
  };
});

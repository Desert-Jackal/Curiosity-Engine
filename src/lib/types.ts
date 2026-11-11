export type Domain = "ai" | "hardware" | "materials" | "physics" | "wildcard";

export type ClaimLevel = "established" | "plausible" | "speculation";

export type LabId = "context" | "memory" | "bandgap";

export type Pathway = {
  title: string;
  detail: string;
  level: Exclude<ClaimLevel, "established">;
};

export type SourceRef = {
  name: string;
  url: string;
};

export type Signal = {
  id: string;
  title: string;
  domain: Domain;
  published: string;
  origin: "desk" | "arxiv";
  novelty: number;
  impact: number;
  editionRank?: number;
  whatChanged: string;
  whyItMatters: string;
  established: string[];
  plausible: string[];
  speculation: string[];
  pathways: Pathway[];
  questions: string[];
  sources: SourceRef[];
  lab?: LabId;
  wireNote?: string;
};

export type ImaginePathway = {
  title: string;
  level: string;
  detail: string;
};

export type ImagineParsed = {
  reading: string;
  whereWeMightBeWrong: string;
  pathways: ImaginePathway[];
  questions: string[];
};

export type ImagineRecord = {
  at: string;
  ask: string;
  reading: string;
  whereWeMightBeWrong: string;
  pathways: ImaginePathway[];
  questions: string[];
  raw: string | null;
};

export const DOMAIN_LABEL: Record<Domain, string> = {
  ai: "Frontier AI",
  hardware: "AI hardware",
  materials: "Materials",
  physics: "Physics",
  wildcard: "Wildcard",
};

export const LAB_LABEL: Record<LabId, string> = {
  context: "Context tax",
  memory: "Memory wall",
  bandgap: "Bandgap sketch",
};

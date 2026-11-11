import type { Signal } from "@/lib/types";

export const EDITION = {
  id: "01",
  date: "2026-11-11",
  title: "Forgetting, the memory wall, and a gap past seven electron volts",
};

export const PASSED = [
  {
    title: "Fabric.AI MicroLED interconnect filing",
    detail:
      "A US patent application dated 11 Nov 2026, with Kopin, about spare MicroLED channels for fault tolerance and a GPU-ready signal. A filing is not a measured link. No public bandwidth, energy per bit, or error rate. Parked, not briefed.",
    url: "https://www.morningstar.com/news/globe-newswire/9875368/fabricai-files-us-patent-application-to-put-surplus-microled-channels-to-work-for-fault-tolerance-and-faster-gpu-synchronization",
  },
];

export const DESK: Signal[] = [
  {
    id: "sig-compaction",
    editionRank: 1,
    title: "An agent can forget almost everything and still fix the bug",
    domain: "ai",
    published: "2026-11-08",
    origin: "desk",
    novelty: 88,
    impact: 82,
    lab: "context",
    whatChanged:
      "NVIDIA researchers, via a DAIR.AI roundup on 8 Nov 2026, tested whether long agent traces actually need to stay in context. On SWE-bench Verified, Claude Opus 4.5 scored 70.2 with one action per context — carrying only a short written summary — against 70.0 with the full history. Median peak context fell from 32K tokens to 8K. The best end-of-conversation compaction setting in that writeup raised the same model to 74.8.",
    whyItMatters:
      "Agent cost is dominated by rereading the past. If a summary holds the score, the KV cache stops being a law of nature and becomes a design choice. The same note says later tokens can cost up to 7× more to generate than early ones on frontier open-weight models. That is the tax this result is poking.",
    established: [
      "Secondary report, not a PDF we re-read this edition: one-action compaction held Opus 4.5 at 70.2 vs 70.0 full-history on SWE-bench Verified, with median peak context 32K → 8K.",
      "The same report: the best end-of-conversation compaction setting scored 74.8.",
      "The same report: on long inputs, reading selectively and compacting only as a fallback matched or beat full-input baselines in almost every case they tried.",
      "The same report: later tokens cost as much as 7× earlier tokens to generate, on frontier open-weight models. That is a cost measurement, not a quality one.",
    ],
    plausible: [
      "Harnesses that summarize after each tool call will run more concurrent coding agents in the same memory, on tasks that look like SWE-bench.",
      "The 74.8 bump is a hint that a cleaned trace can beat a messy one — compaction as editing, not just compression.",
    ],
    speculation: [
      "Training runs could reinforcement-learn on summaries instead of full rollouts. We do not know which failures the summary deletes. Those failures are often the learning signal.",
      "Nothing here says a 1M-token context is useless. It says some jobs were paying for one they did not use.",
    ],
    pathways: [
      {
        title: "Quality per peak context",
        level: "plausible",
        detail:
          "Score agents on the highest context they touched, not tokens generated. A harness that stays under 8K and matches full-history quality is a different machine from one that drifts to 32K for the same score.",
      },
      {
        title: "Summary as the negative, too",
        level: "speculation",
        detail:
          "Write the compaction prompt so it must keep failed attempts, not only the plan that worked. Then rerun the SWE-bench comparison. If the score drops, the summary was laundering the trace.",
      },
    ],
    questions: [
      "Does the 70.2 result survive on a second scaffold, or is it Opus-plus-this-harness?",
      "What did the summary drop on the tasks the one-action agent lost?",
      "Is the 7× later-token cost mostly attention over the KV cache, or decode implementation?",
    ],
    sources: [
      {
        name: "DAIR.AI weekly roundup, 8 Nov 2026",
        url: "https://x.com/dair_ai/status/2119467209550365099",
      },
    ],
  },
  {
    id: "sig-memory-wall",
    editionRank: 2,
    title: "The memory wall is being redesigned in public — mostly with vendor numbers",
    domain: "hardware",
    published: "2026-11-06",
    origin: "desk",
    novelty: 76,
    impact: 90,
    lab: "memory",
    whatChanged:
      "Three November reports describe the same bottleneck from different sides. Qualcomm says first-generation High Bandwidth Compute silicon ran a full memory read-write path, with near-memory math, in its San Diego lab. OCP Global Summit (12–15 Oct) drew proposals that put NAND beside the GPU or attach 3.2 TB of LPDDR5X to an XPU. NVIDIA’s 5 Nov blog claims agent throughput per dollar jumped far more than HBM capacity did.",
    whyItMatters:
      "Frontier models are already sparse. The scarce resource is bytes that stay close to the math, especially KV cache for long-lived agents. If capacity can grow without a matching HBM tax, the shape of an inference rack changes. If the claims are optimistic, HBM remains the bottleneck everyone already priced in.",
    established: [
      "Qualcomm, via press on 2 Nov 2026: HBC lab silicon exercised the read-write path and near-memory compute at production-representative dimensions, on standard automated test equipment, with randomized weights and activations. We have not seen a datasheet.",
      "Qualcomm’s stated figures, same reports: about 18× the effective bandwidth of LPDDR5X, and more than 5× the bandwidth per watt of projected HBM4 — short of an earlier 6× projection. Dragonfly AI250 is described as sampling in the first half of 2027. A liquid-cooled rack concept is quoted at 38.6 TB of memory and 7.4 PB/s effective bandwidth.",
      "OCP coverage (TrendForce, 6 Nov 2026): SK hynix discussed a memory rack and NAND stacked beside the GPU. Nallasway and partners described an XPU module with 3.2 TB of LPDDR5X over SerDes. Metrum AI and Solidigm presented shared-SSD measurements. Figures below are theirs, not ours.",
      "NVIDIA blog, 5 Nov 2026, is a vendor benchmark narrative: from Blackwell Ultra to Vera Rubin, HBM per GPU up about 3% while agentic throughput per dollar on SemiAnalysis AgentX rose by up to 30×. At 125 tokens/s/user they claim Vera Rubin NVL72 up to 30× GB300 NVL72. Separate comparison: GB300 NVL72 up to 10× H200 at 100 tokens/s/user, with HBM per GPU roughly doubling over that longer span.",
    ],
    plausible: [
      "Resident agents — many paused KV caches, modest tokens per second — are the workload that makes capacity-tier memory rational. Peak chat may still want HBM.",
      "NVFP4 checkpoints (NVIDIA lists FLUX.2 [klein], Inkling, Beam 1.0, Muse Spark, Step 5 Preview, Nemotron 3.5 Super VL) shrink the bytes that have to sit in the fast tier. That part is a software move, and it stacks with any of the hardware moves.",
      "Paging KV to a nearby LPDDR tier during tool calls, which NVIDIA describes for the Vera CPU over NVLink-C2C, is a concrete systems design even if the 30× is marketing-shaped.",
    ],
    speculation: [
      "HBM becomes a specialty tier and most inference bytes live in stacked LPDDR. Yield, latency, and the software rewrite are all unshown.",
      "A 3.2 TB module or a 38.6 TB rack does not mean one model of that size. It means many residents, or a very long cache. Conflating the two is how these announcements get misread.",
    ],
    pathways: [
      {
        title: "Fit the cache, then the weights",
        level: "plausible",
        detail:
          "For a batch-1 agent, bytes are weights plus KV. Double the context before you double the parameters and watch which one breaks an 80 GB part versus a 3 TB proposal. The Lab does this arithmetic without pretending the bandwidth numbers are measured here.",
      },
      {
        title: "Decode is a bandwidth division",
        level: "plausible",
        detail:
          "Batch-1 decode tok/s is roughly memory bandwidth divided by bytes touched per token. If HBC’s watt advantage is real, the win shows up as tokens per joule on capacity-heavy prompts, not as a higher peak on a short one.",
      },
    ],
    questions: [
      "What is HBC’s latency to a random KV page, not its advertised bandwidth?",
      "Which of NVIDIA’s 30× is precision, sparsity, the Vera CPU, and the benchmark — and which is the platform?",
      "Does a 3.2 TB LPDDR module keep its bandwidth when many agents fault pages at once?",
    ],
    sources: [
      {
        name: "Wccftech on Qualcomm HBC, 2 Nov 2026",
        url: "https://wccftech.com/qualcomm-hbc-silicon-ai-inference-memory-bottleneck-data-center-product-taped-out/",
      },
      {
        name: "TrendForce on OCP memory proposals, 6 Nov 2026",
        url: "https://insights.trendforce.com/p/14x-hbm-capacity-32tb-per-xpu",
      },
      {
        name: "NVIDIA, full-stack memory codesign, 5 Nov 2026",
        url: "https://blogs.nvidia.com/blog/memory-full-stack-codesign/",
      },
    ],
  },
  {
    id: "sig-cornell",
    editionRank: 3,
    title: "A semiconductor past 7 eV that still conducts",
    domain: "materials",
    published: "2026-11-03",
    origin: "desk",
    novelty: 91,
    impact: 80,
    lab: "bandgap",
    whatChanged:
      "Cornell engineers reported, in Nature (7 Oct 2026) and a 3 Nov news story, a silicon-doped aluminum gallium oxide with a bandgap above 7 electron volts — past a ~6 eV record that had started to behave like an insulator. Silicon added at low temperature supplied mobile electrons. In the colossal-bandgap range (above 6 eV) the films showed room-temperature conductivity more than 100 million times higher than earlier reports in that class. They built working devices.",
    whyItMatters:
      "Wider gaps tolerate stronger electric fields before they break, which is the point of the power electronics in EVs, aircraft, grids, and data-center supplies. The open question is not the gap. It is whether contacts, doping, and mobility survive outside the film.",
    established: [
      "Nature paper, 7 Oct 2026, Cornell (Schlom senior author): Si-doped aluminum gallium oxide, bandgap exceeding 7 eV, previous record about 6 eV.",
      "Room-temperature conductivity in these films reported as more than 100 million times prior results for colossal-bandgap (>6 eV) materials.",
      "Working devices exist. Practical deployment does not. Jena, quoted in the Cornell story, said further work is required.",
    ],
    plausible: [
      "If mobility and contacts hold up, data-center and grid converters can switch higher voltage with less loss than SiC or GaN. That is the use the authors name. It is not a module yet.",
      "The HKU gallium-oxide megawatt module (separate card) is the nearer engineering object. Cornell is the materials ceiling further out.",
    ],
    speculation: [
      "Jena also pointed at vacuum-UV photonics and telecom quantum-cascade lasers. Interesting, and not demonstrated in this result.",
      "Baliga’s figure of merit explodes on paper as bandgap rises. Mobility usually falls. A 7 eV film with poor contacts is a resistor. See the Lab before believing a million-fold device win.",
    ],
    pathways: [
      {
        title: "Ask mobility, not the gap",
        level: "plausible",
        detail:
          "The next paper that matters will quote channel mobility, contact resistance, and breakdown field on the same film. Until those three sit together, the 7 eV number is a materials existence proof.",
      },
      {
        title: "Where the watts actually are",
        level: "speculation",
        detail:
          "A data-center win is a supply that wastes less of the rack’s electricity as heat. Pair this film, if it ever becomes a switch, with the cooling-materials work on the CrysVCD card — one cuts conversion loss, the other tries to get the remaining heat out.",
      },
    ],
    questions: [
      "What breakdown field did the working devices actually hold, and at what defect density?",
      "Can the film be doped and contacted on a wafer size anyone can package?",
      "Does conductivity survive once the film is warm, the way a real converter runs hot?",
    ],
    sources: [
      {
        name: "Cornell Chronicle, 3 Nov 2026",
        url: "https://news.cornell.edu/stories/2026/11/cornell-semiconductor-sets-record-widest-bandgap",
      },
    ],
  },
  {
    id: "sig-hku",
    editionRank: 4,
    title: "Gallium oxide has switched a megawatt — in pulses",
    domain: "materials",
    published: "2026-11-09",
    origin: "desk",
    novelty: 80,
    impact: 74,
    lab: "bandgap",
    whatChanged:
      "HKU engineers, in Nature Communications, built a gallium oxide power module that repeatedly switched 1,000 volts and 1,000 amperes at 1 kHz, a peak of one megawatt. They call it the first ultra-wide-bandgap multi-chip module at that power, more than a hundred-fold jump over earlier demonstrations in similar materials. Junction-side cooling and a high-permittivity insulating layer let it keep working above 250°C.",
    whyItMatters:
      "This is a package result, not only a film. Pulsed megawatts are how you protect a grid, kick a medical system, or feed a pulsed experiment. It is not yet a data-center power supply, and 1 kHz is a long way from the switching frequencies those supplies like.",
    established: [
      "Nature Communications: Ga2O3 module, 1000 V and 1000 A at 1 kHz, 1 MW peak, functional above 250°C.",
      "Authors describe junction-side cooling plus a high-permittivity layer that reshapes the electric field, as the co-design that made the power level possible.",
      "Claimed more than 100× prior demonstrations using similar materials, and a first for a UWBG multi-chip module at megawatt level (Dr Gong, as quoted by HKU).",
    ],
    plausible: [
      "Pulsed-power uses the authors list — grid protection, accelerators, medical systems, fusion auxiliaries — match the duty cycle they actually showed.",
      "Packaging lessons (cool the junction side, spread the field in the insulator) transfer to other ultra-wide-gap devices, including the Cornell films, whether or not gallium oxide wins.",
    ],
    speculation: [
      "Continuous, efficient converters for EV drivetrains or racks. Not what was measured. Thermal cycling and long-life reliability are unshown.",
    ],
    pathways: [
      {
        title: "Pulsed first, continuous later",
        level: "plausible",
        detail:
          "Treat this as a protection and pulse technology. The experiment to watch is hours at temperature, not a higher peak in a microsecond.",
      },
    ],
    questions: [
      "What efficiency and what thermal resistance, over how many cycles?",
      "Is 1 kHz a device limit or a test-stand limit?",
    ],
    sources: [
      {
        name: "HKU, 9 Nov 2026",
        url: "https://lead.hku.hk/en/news/2026/11/world-first-power-module-hku-engineering/",
      },
    ],
  },
  {
    id: "sig-frontier-learning",
    editionRank: 5,
    title: "Train on problems the model can barely do — and keep moving that edge",
    domain: "ai",
    published: "2026-09-28",
    origin: "desk",
    novelty: 77,
    impact: 73,
    whatChanged:
      "Faro, Ramesh, Bogunovic, and Lucchi (arXiv 2609.35426, 28 Sep 2026) argue that a fixed pool of RL problems goes stale: once the model mostly succeeds, the mixed success/failure signal dries up. Frontier learning generates new problems online from procedural generators and uses regret to aim at the current edge of difficulty. Across reasoning tasks and model families they report higher relative gains than fixed-pool baselines.",
    whyItMatters:
      "Post-training is where reasoning keeps moving, and the data for it does not exist until you invent problems the model has not memorized. If the generator is the scarce piece, labs will spend more effort on task design than on another static dataset.",
    established: [
      "The paper’s claim, from the abstract: fixed pools lose learning signal as success saturates; online generators aimed by regret produced higher relative gains than those baselines on the tasks they tried.",
      "We do not have effect sizes in front of us. “Higher relative gains” is not a number. Do not invent one.",
    ],
    plausible: [
      "The same idea ports to coding and research agents: generate tasks the current policy solves about half the time, discard the rest.",
      "It pairs with Quest (separate card). Quest synthesizes tasks with rubric rewards. Frontier learning says the pool must move. Together they are a recipe; neither paper ran that combination.",
    ],
    speculation: [
      "Open-ended generators that chase regret could drift into cheap puzzles that look hard and teach nothing transferable. The regret signal does not know what you care about.",
    ],
    pathways: [
      {
        title: "Hold the success rate in a band",
        level: "plausible",
        detail:
          "Log, per training step, the fraction of rollouts that succeed. If it leaves roughly 30–70%, the pool is stale or impossible. That plot is the whole method, stripped of branding.",
      },
    ],
    questions: [
      "How much of the gain is the generator’s coverage versus the regret scheduler?",
      "Do the gains hold when the test tasks cannot be produced by the same generator?",
    ],
    sources: [
      {
        name: "arXiv 2609.35426",
        url: "https://arxiv.org/abs/2609.35426",
      },
    ],
  },
  {
    id: "sig-quest",
    editionRank: 6,
    title: "Eight thousand synthetic tasks, and a research agent that cites",
    domain: "ai",
    published: "2026-09-25",
    origin: "desk",
    novelty: 74,
    impact: 70,
    whatChanged:
      "Quest, a NeurIPS 2026 poster (session listed 10 Dec, so this is the paper, not the talk), trains open deep-research agents from 2B to 35B parameters on synthetic tasks. Rubric trees produce verifiable rewards without human labels. With 8K synthesized tasks they report Quest-35B at 30.7% on Mind2Web 2, against 28% for OpenAI Deep Research and 18% for Gemini Deep Research, and the best overall among recent open-weight agents on a suite of eight benchmarks. A built-in context manager is part of the recipe.",
    whyItMatters:
      "If rubric-checked synthetic tasks are enough, the limit on research agents is the rubric, not a mountain of annotated browsing traces. That is a different bottleneck, and a more honest one.",
    established: [
      "Authors’ reported numbers: 8K synthetic tasks; Quest-35B at 30.7% Mind2Web 2 vs 28% and 18% for the two named closed research agents.",
      "Training mix described as mid-training, supervised fine-tuning, and RL, plus a context-management mechanism. Poster date is 10 Dec 2026 — accepted work, not yet a conference postmortem.",
    ],
    plausible: [
      "Small open models with a strict rubric can beat a larger closed agent on the narrow thing the rubric measures. Mind2Web 2 is one narrow thing.",
      "Context management showing up inside the training recipe rhymes with the compaction result. Long research traces may be a liability unless something throws them away on purpose.",
    ],
    speculation: [
      "Synthetic rubrics become the new benchmark-overfit. A model that farms its own trees can look strong and still fail the first question whose answer is not shaped like the tree.",
    ],
    pathways: [
      {
        title: "Steal the rubric, not the weights",
        level: "plausible",
        detail:
          "The transferable object is the task generator with a checkable reward. Reimplement that on a domain you can grade (citations resolve, numbers match a source) before you trust the 30.7.",
      },
    ],
    questions: [
      "How much of Mind2Web 2 was reachable from the synthetic distribution?",
      "What happens when the rubric is slightly wrong — does the agent learn the bug?",
    ],
    sources: [
      {
        name: "NeurIPS 2026 poster listing",
        url: "https://neurips.cc/virtual/2026/poster/150926",
      },
    ],
  },
  {
    id: "sig-crysvcd",
    editionRank: 7,
    title: "Materials models that obey chemistry often enough to be useful",
    domain: "materials",
    published: "2026-11-09",
    origin: "desk",
    novelty: 72,
    impact: 68,
    whatChanged:
      "MIT researchers (Nature Computational Science, reported 9 Nov 2026) added a valence-shell constraint, CrysVCD, to crystal generators. Models met chemical rules more often. They report lattice-dynamics stability in nearly 70% of generations, and — when fine-tuned on stability — 68% mechanical stability and 85% metastability. That was about ten times more efficient than generating first and screening after. They then asked for high thermal conductivity and easy polarization.",
    whyItMatters:
      "Generative materials models have been prolific and brittle. A constraint that raises the fraction of stable crystals changes the cost of looking. Ju Li ties the thermal-conductivity target to data centers, where the article says about 30% of energy goes to cooling. Those candidates are computational until someone grows one.",
    established: [
      "Nature Computational Science: valence constraints improved stability rates as above. The 68% / 85% / ~70% figures are the authors’ computational tests, not fab yields.",
      "Order-of-magnitude efficiency versus post-hoc screening is their comparison, on their generators.",
    ],
    plausible: [
      "High-conductivity candidates from this loop are a reasonable shortlist for people who actually measure thermal conductivity. The shortlist is the product.",
      "The same constraint should drop onto the next generator, which is the claim Mingda Li makes. Cheap to test.",
    ],
    speculation: [
      "A data-center cooling solid invented this way, in production, any time soon. Synthesis, interfaces, and cost are the usual graveyard.",
    ],
    pathways: [
      {
        title: "Measure one candidate",
        level: "plausible",
        detail:
          "The result becomes physically real the day a generated crystal’s thermal conductivity is measured and matches the prediction within an error bar they publish in advance.",
      },
    ],
    questions: [
      "Which known stable crystals does the constraint reject?",
      "Are the high-conductivity hits chemically boring compounds we already use, or genuinely new?",
    ],
    sources: [
      {
        name: "MIT Energy Initiative, 9 Nov 2026",
        url: "https://energy.mit.edu/news-events/news/ai-helps-design-new-materials-work-real-world",
      },
    ],
  },
  {
    id: "sig-beol",
    editionRank: 8,
    title: "Transistors grown on the back of a finished chip, at 150°C",
    domain: "hardware",
    published: "2026-11-09",
    origin: "desk",
    novelty: 75,
    impact: 71,
    whatChanged:
      "An MIT group reported back-end transistors whose channel is amorphous indium oxide, grown around 150°C so the process does not wreck the finished logic underneath. With a ferroelectric hafnium-zirconium-oxide layer they built memory transistors about 20 nm across. Switching landed at 10 nanoseconds, which is as fast as their instruments could check.",
    whyItMatters:
      "A large share of energy in a chip is spent moving data to memory that sits somewhere else. Logic-class devices in the back-end-of-line, if they yield, put a little memory in the wiring. That is a materials constraint (what will grow when the wafer is already done) as much as a circuit one.",
    established: [
      "Amorphous indium oxide channel, growth near 150°C, back-end integration claimed without damaging the front-end.",
      "Memory transistors ~20 nm, 10 ns switching at the instrument floor. Faster than that is unmeasured, not disproven.",
    ],
    plausible: [
      "Energy per switch drops because the device turns off cleanly and the memory is local. The article argues this; the watt figure for a full chip is not in what we read.",
      "Pairs with the memory-wall story. Bytes that do not leave the package are bytes you do not have to fetch from HBM.",
    ],
    speculation: [
      "Replacing SRAM or HBM. A 20 nm lab transistor is not a cache hierarchy. Yield across a reticle is the whole question.",
    ],
    pathways: [
      {
        title: "Count the joules on one hop",
        level: "plausible",
        detail:
          "Publish energy to move one bit from this back-end cell versus from SRAM one millimeter away. If that ratio is not large, the integration story is academic.",
      },
    ],
    questions: [
      "What is the cycle endurance of the ferroelectric stack after the 150°C process?",
      "How many of these transistors on one die still match?",
    ],
    sources: [
      {
        name: "MIT Energy Initiative, 9 Nov 2026",
        url: "https://energy.mit.edu/news-events/news/new-materials-could-boost-energy-efficiency-microelectronics",
      },
    ],
  },
  {
    id: "sig-arch-map",
    editionRank: 9,
    title: "A map, not a result: MoE, Muon, and linear attention as the 2026 default",
    domain: "ai",
    published: "2026-10-04",
    origin: "desk",
    novelty: 48,
    impact: 78,
    whatChanged:
      "Jiaxin Zhang’s 4 Oct 2026 synthesis of public lab reports is useful because it is a map. Mixture-of-experts is the open-frontier default (DeepSeek-V3: one shared expert plus 256 routed, eight active; Kimi K2 reported near 1.04T total and 32B active across 384 experts). Llama 3’s 405B dense model is the cited holdout, chosen for stability. Muon — momentum orthogonalized by Newton–Schulz — shows up in GLM-4.5/5, in Kimi’s MuonClip (a claimed 15.5T-token run with no loss spikes), and, per the same synthesis, in DeepSeek-V4. Hybrid linear attention is shipping: Kimi K3’s Kimi Delta Attention, Qwen3.5’s Gated DeltaNet.",
    whyItMatters:
      "If you only watch product launches you miss the recipe change. The trainable object in 2026 is a sparse model, often with a linear-attention hybrid, optimized by something other than AdamW. Dense-plus-AdamW is now the conservative branch, not the only one.",
    established: [
      "This card is a synthesis of other people’s technical reports, via one blog post. It is not a new experiment.",
      "The architectural facts above are as those reports are summarized there. Where a lab states a parameter count or a spike-free run, that statement is theirs.",
    ],
    plausible: [
      "Qwen3.5’s claim of roughly 400B-class quality at ~17B-active speed, if it holds up under independent eval, is the practical form of hybrid linear attention: long context you can afford to train on, not only serve.",
      "GLM-5.2’s reported IndexShare cut of ~2.9× in 1M-context FLOPs, and DeepSeek-V4’s compressed-sparse attention, say 1M context is being made cheap enough to spend on RL. Cheap context is what Frontier Learning and Quest both want.",
      "Muon’s authors claim about 2× compute efficiency versus AdamW. Several flagship reports say they switched. Independent replication at that scale is still thin in public.",
    ],
    speculation: [
      "AdamW is over. It is not. The labs that stayed in higher precision for stability had a reason. A new optimizer with a bad loss spike at 10T tokens is an expensive lesson.",
      "Linear attention fully replacing softmax. The hybrids exist because the swap is not free.",
    ],
    pathways: [
      {
        title: "Read the active-parameter count",
        level: "plausible",
        detail:
          "Compare systems on active parameters, context cost, and tokens per joule. Total parameter count is a press number. Kimi’s 1T/32B split is the pattern: a huge shelf of experts, a small slice awake.",
      },
    ],
    questions: [
      "Which Muon gains survive when the baseline is a well-tuned AdamW, not a neglected one?",
      "Where does Gated DeltaNet or KDA lose to softmax in a way a benchmark won’t catch?",
    ],
    sources: [
      {
        name: "Jiaxin Zhang, 4 Oct 2026",
        url: "https://jxzhangjhu.github.io/blog/2026/how-frontier-labs-train-llms/",
      },
    ],
  },
  {
    id: "sig-asi-arch",
    editionRank: 10,
    title: "A loop that searched linear attention and kept 105 architectures",
    domain: "ai",
    published: "2026-07-08",
    origin: "desk",
    novelty: 83,
    impact: 64,
    whatChanged:
      "ASI-Arch (COLM 2026, OpenReview) is a closed loop — research, experiment, analyze, update — aimed at linear attention. It ran 1,773 experiments and reports 105 architectures at state of the art on their setup. The best improved on DeltaNet by nearly three times the gain Mamba2 had over DeltaNet.",
    whyItMatters:
      "This is an existence proof that a long-horizon agent loop can search a real architecture space, not a toy. It does not show the loop can pose the question. The question was linear attention. The search was large and narrow.",
    established: [
      "OpenReview abstract: 1,773 experiments, 105 SOTA architectures under their criteria, best gain versus DeltaNet nearly 3× the Mamba2-over-DeltaNet gain.",
    ],
    plausible: [
      "The useful piece is the ablation of the loop itself — which part of research-experiment-analyze-update actually moved the result. The abstract says they did that analysis.",
      "Someone will point the same loop at compilers, kernels, or interconnect schedules. The search space has to be cheap to evaluate or the 1,773 becomes a million dollars.",
    ],
    speculation: [
      "Autonomous research that replaces the person who decides what is worth searching. Not what this paper did.",
    ],
    pathways: [
      {
        title: "Steal the eval, audit the winner",
        level: "plausible",
        detail:
          "Re-train the single best architecture on a held-out corpus the loop never saw. If the gain vanishes, the loop overfit its own benchmark. That test is cheaper than re-running 1,773 trials.",
      },
    ],
    questions: [
      "Did a human still write the fitness function that made the search ‘work’?",
      "How many of the 105 are trivial renamings of one idea?",
    ],
    sources: [
      {
        name: "OpenReview, COLM 2026",
        url: "https://openreview.net/forum?id=hzGsPt40N0",
      },
    ],
  },
];

export function deskById(id: string) {
  return DESK.find((s) => s.id === id);
}

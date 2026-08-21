---
title: Process, Multi-Team Coordination, LH Context
sources:
  - DRAFT_01_The_Experimentation_Process.md — 6-phase process (planning, communication, pre-live, go-live, during, conclusion) + golden rules
  - DRAFT_02_AI_Tools_for_Experimentation.md — Testing Compass (7 gates), Hypothesis Coach (6 dims), Related Tests agent, AI limits
  - DRAFT_06_Managing_Multiple_Teams_on_One_Product.md — collision-first framing of multi-team coordination
  - DRAFT_10_Managing_Multiple_Teams_on_One_Product.md — parallelism-as-goal reframing of the same topic
  - Experimentation Ways of Working v26.pdf — official Digital Hangar WoW doc (Apr 15, 2026): golden rules, guardrails, BCR thresholds, revenue math
  - "Hackathon d'Expérimentation (3).pdf" — image-only PDF: CoE structure diagram (Decentralized vs Champions, with ISB / ANC value streams + Experimentation Platform + Chapter)
  - "Comment améliorer le Stakeholder Map (1).pdf" — image-only PDF: "Tenets of smooth Commercial testing" — Sales push vs Hangar-Experimentation responsibility split, communicate & align, monitor & limit concurrent tests
  - "Q&A Expérimentation.pdf" — 13-page canonical Q&A from the Digital Hangar team (process steps, the A/B testing platform usage, visibility, theory, test setup, A/A reliability)
  - "Scaling Experimentation Quality at Booking.com.pdf" — Edgar Cano et al., Mar 2026: ~1,000 parallel experiments, 3-pillar EQ metric, "80% had no power calculation" finding
  - Podcast Outline - Take 2.md — Brice's own framing of Digital Hangar, 60+ teams, Don't Know / Can't Do / Don't Trust, revenue-not-conversion
last_extracted: 2026-05-27
extracted_by: subagent (Coach knowledge swarm)
---

# Process, Multi-Team Coordination, LH Context

## 1. End-to-end experimentation process

Two source documents describe the process. DRAFT_01 is the longer scaling-context narrative; the Digital Hangar Ways of Working v26 PDF is the official LH-internal rulebook. They agree on the spine but use different phase labels.

### The six phases (DRAFT_01)

| Phase | Purpose | Who | Artifacts |
|---|---|---|---|
| 1. Planning & design | Hypothesis, power calc, guardrails, review | Product team + Experimentation expert/Champion | Hypothesis doc, power calc, guardrail thresholds |
| 2. Communication (mandatory) | Pre-launch broadcast — no surprises | Owner posts to dedicated channel | Test announcement (hypothesis, segment, duration, owner) |
| 3. Before go-live | QA, conflict check, mutex audiences, roadmap update | Analyst + Champion | QA pass, conflict declaration, roadmap row |
| 4. Go-live | Launch + monitor (hours, then day-1) | Analyst owns; team owns guardrails | Live QA result, guardrail check |
| 5. During the test | Weekly guardrail check; no peeking; 2 wk–1 mo duration | Analyst | Weekly guardrail log |
| 6. Concluding | Decision (ship/kill/inconclusive) + repository entry | Analyst + Product owner | Documented experiment in repository |

### The Digital Hangar's official 5-step framing (Q&A Expérimentation.pdf, p.5)

1. **Ideation & Preparation** — product team prepares the test, internal prioritization with stakeholders, design of experiment, uses dedicated Trackspace template
2. **Validation** — experiment team reviews and provides suggestions once ticket + the A/B testing platform experiment are created
3. **Communication** — publish on Collab hub, reach out to impacted parties, ensure no overlaps
4. **Publishing & Monitoring** — Data Analyst publishes; product team monitors results
5. **Take action** — Data Analyst + product managers act on results, document findings in template

> "The analyst running the test is responsible for its execution and timing. No conclusions should be drawn by anyone else." — Experimentation Ways of Working v26.pdf, p.6

### Artifacts produced at each phase

- **Trackspace ticket** (LH-specific): templated, used from ideation to conclusion, surfaces on the timeline board for org-wide visibility (Ways of Working, p.6)
- **Hypothesis** using template: *"By modifying [X], we expect to improve [Y] success metric, resulting in [desired outcome], without adversely affecting [Z] guardrail metric"* (Ways of Working, p.6)
- **Power calculation** via Booking.com's power calculator (DRAFT_01, p.1; Ways of Working, p.6)
- **Guardrail thresholds**: BCR drop limits at 5% (bold) / 2% (safe) / 1% (extra safe) — see §5 for revenue math (Ways of Working, p.10)
- **Collab Hub post** (Teams channel) — both before go-live and after conclusion
- **Docspace entry** in the Experimentation Repository, templated

### Golden rules (DRAFT_01 + Ways of Working agree)

1. Pre-register hypothesis + success metric — no goalpost moving
2. One primary metric per test
3. Normalize by sample size (clicks per user, not total clicks)
4. No significance, no go-live (enforced default; exceptions need sign-off)
5. Enforce the process, don't suggest it — embed in tools, track compliance
6. Document every test

## 2. Where Carter / EXP-OS fits in the process

Carter sits in **Phase 1 (Planning & design)** and Phase 6 (Conclusion documentation / discoverability). DRAFT_02 explicitly names three tools that map to Carter's surface:

- **Testing Compass** — 7-gate decision tree that runs *before* hypothesis writing. Determines whether an A/B test is even the right method. (DRAFT_02, p.1)
- **Hypothesis Coach** — LLM layer that scores a draft hypothesis on 6 Thomke dimensions and asks pointed questions. (DRAFT_02, p.2)
- **Related Tests agent** — searches the repository for semantically similar past experiments. Activates institutional memory. (DRAFT_02, p.3)

### Handoffs in and out of Carter

- **Into Carter**: a draft idea or hypothesis from a product owner, business analyst, or Champion
- **Out of Carter**: a validated, scored hypothesis ready for the human Champion review meeting (the 30-minute review described in DRAFT_01, Phase 1)
- Carter does NOT replace the Champion review — it pre-filters so the Champion's 20% time is spent on judgment calls, not catching missing metrics

### What Carter does NOT do (out of scope by design)

> "AI cannot design your experiment. AI cannot interpret ambiguous results. AI cannot replace statistical rigor. Using AI to 'predict' test results or 'skip' the testing phase is a trap." — DRAFT_02, p.4

- Does not pick randomization unit, traffic allocation, or guardrail thresholds
- Does not interpret ambiguous result tradeoffs (e.g., +revenue / -satisfaction)
- Does not run the test, monitor it, or conclude it
- Does not replace the Champion review meeting

## 3. AI in the experimentation loop

From DRAFT_02:

### Where AI is allowed / encouraged

- Hypothesis evaluation against the 6 Thomke dimensions (source / variables / prediction / measurement / verification / motivation)
- Methodology routing (Testing Compass — should you even A/B test?)
- Semantic search across past experiments (Related Tests)
- "Answer-back" Q&A from a structured knowledge base (Brice's "every answer must be a link" rule, Podcast Outline ch.3)

### Where human judgment is required

- Experiment design (randomization, traffic %, guardrails)
- Interpreting tradeoff results
- Deciding what to ship when significance is borderline
- Statistical rigor / power calculation choices

### The framing principle

> "AI in experimentation is not about replacing statisticians or automating decisions. It's about reducing cognitive load for the people who actually run tests day to day." — DRAFT_02, p.1

> "AI didn't create our capability. It activated our memory." — DRAFT_02, p.1

> "Documentation is the foundation. AI is the multiplier. If you skip the boring step — structured, link-based knowledge capture — your AI tools won't work." — Podcast Outline, ch.3

The IP boundary is implicit, not explicit: the knowledge base lives in LH SharePoint / Docspace / Trackspace and the AI tool sits on top of it. Brice notes that he built the link-based knowledge base for two years *before* GPT existed, then the AI tool was the multiplier.

## 4. Multi-team coordination & collision risk

DRAFT_06 and DRAFT_10 cover the same topic but with different framings — see §11 for the synthesis. Both agree on the three conflict types.

### The collision problem

> "Imagine Team A is testing a new homepage banner. Team B is testing a redesigned navigation bar on the same page. Team C is running a pricing experiment that changes the call-to-action text. Each team runs their experiment independently. Each sees statistically significant results. Each ships their change. Three months later, the combined effect is negative, and nobody understands why." — DRAFT_06, p.1

### Three types of conflicts (both drafts agree)

1. **Visual conflicts** — two experiments modify the same UI element or adjacent elements; incoherent UX (banner + navigation removal on same page)
2. **Metric conflicts** — two experiments target the same success metric; net effect depends on which combinations users saw
3. **Audience conflicts** — overlapping segments with competing traffic allocations; you can end up with zero clean control users

### Three solutions, ladder of sophistication

| Solution | When it works | Limit |
|---|---|---|
| Manual conflict check via test roadmap | 5–10 concurrent tests | Breaks at 50+ |
| Mutually exclusive audiences (1-33% / 34-66% / 67-100%) | Selectively, where conflicts are real | Reduces traffic per test → longer durations |
| Layered experimentation (orthogonal randomization) | 50+ concurrent tests (Google, Microsoft, Booking.com) | Requires platform support — not all tools do this natively |

### Governance rules (both drafts agree on these five)

1. **One owner per page surface** — surface owner has veto power
2. **Maximum 2-3 concurrent tests per surface** unless you have layered experimentation
3. **Mandatory conflict declaration** when filing — page, elements, metrics — checked by Champion/CoE before launch
4. **Test duration limits** — >1 month triggers review; blocks traffic + raises interaction risk
5. **Centralized guardrail monitoring** — when multiple tests run on a surface, a breach could come from any of them; CoE/owner monitors aggregate

### LH-specific tenet (Stakeholder Map PDF, image content)

The LH "Tenets of smooth Commercial testing" splits responsibility on contested surfaces between two ownership tracks:

- **Sales – Commercial push**: Ownership = Sales team. Timeline = less than 2 months, predefined time. Metric = Conversion + commercial predefined metrics. Scope = modification on specific pages.
- **Hangar – Experimentation**: Ownership = VSs (Value Streams). Timeline = stopped when significance is reached. Metric = Any. Scope = modification on pages within VS scope.

The PDF notes the "BUT": commerce teams currently don't have bandwidth/resources to support VSs on experimentation, "SO we need" Communicate & Align via roadmap update, all info in tickets, ISB stakeholder identification, ZYS board access. Operational rules: "Handover tests to VSs once insights are discovered", "Limit of 1 month per test", "Monitor ongoing tests and results on a weekly basis", "Document the work performed", "Define one metric for each VS and set it by default on all experiments".

> "When 3+ teams experiment on the same product surface, things break. Not the code (usually). The validity of results." — DRAFT_06, p.1

> "Running parallel experiments is not a problem. It is the goal." — DRAFT_10, p.1

## 5. AirGroup tenant structure

The AirGroup Digital Hangar spans **5 airlines**: **AirGroup (LH), Swiss (LX), Austrian (OS), Brussels (SN), and ITA**. Confirmed in the Podcast Outline:

> "AirGroup decided a few years ago to build something most legacy companies talk about but rarely do — a full agile product organization called the Digital Hangar, spanning AirGroup, Swiss, Austrian, Brussels, and ITA. 60+ product teams, multiple countries, one digital org." — Podcast Outline, §1

### Scale

- **60+ product teams** across the 5 airlines (Podcast Outline §2; DRAFT_01 references "60+ product teams" via Brice)
- **Multiple countries / markets** with different languages (de/en etc. used as variable values in the A/B testing platform, per Q&A p.9)
- **Different maturity levels** per team — "some testing weekly, some just getting started" (Podcast §2)

### Tenant-specific testing nuances

- Targeting by market and language is set in the A/B testing platform's "Who" section via custom variables (Q&A p.9). The same test can be scoped to a single market.
- Surface types vary by tenant: desktop internal pages, WebViews, native (via Firebase, in progress), but NOT email/marketing pages (Q&A p.6)
- Scope of stakes varies dramatically — "products range from a booking flow to airport check-in to meal preselection... some touch real-world operations — airports, ground handling, regulatory" (Podcast §3 ch.2)

> "When a test can affect operations in 200 airports, you don't get to just ship and see what happens. That forces you to be rigorous." — Podcast Outline ch.2

## 6. Stakeholder map (English summary of French source)

The "Comment améliorer le Stakeholder Map" PDF is a one-page diagram titled **"Tenets of smooth Commercial testing"**. It is structured as two pillars under one banner:

### Pillar 1 — Performing the right tests (Distinct Responsibility)

Splits experimentation work into two clear ownership lanes:

- **Sales / Commercial push lane** — owned by Sales team. Time-boxed (< 2 months). Pre-defined commercial metrics. Specific pages only.
- **Hangar / Experimentation lane** — owned by Value Streams. Runs until significance. Any metric. Pages within the VS's scope.

The current friction: "Its currently not the case, because commerce team have bandwidth and ressources to support VSs on experimentation side and testing interesting new ideas." → **SO we need Communicate & Align** via:
- Update roadmap
- Have all the information in the tickets
- Identify stakeholders (from ISB)
- Give access to ZYS board to all

### Pillar 2 — Performing tests correctly

- Handover tests to VSs once insights are discovered
- Monitor experiment and limit the number of tests live at the same time (limit of 1 month per test; monitor ongoing tests and results on a weekly basis)
- Document the work performed and keep track of it
- Report on the right metrics (define one metric for each VS and set it by default on all experiments; same for sales team)

### Two action topics highlighted on the PDF

> "2 topics: Apply a framework for testing and coordination. Know what is the A/B testing platform for, pure experimentation focus or experimentation and sales push."

### How to engage these stakeholders (synthesized for Coach)

- **Sales / Commercial team**: speak in revenue and conversion vocabulary (Podcast "Conversion is your language. Revenue is their language. Speak theirs."). Their tests are time-boxed and scope-limited — don't pitch open-ended methodology debates.
- **Value Stream product teams**: speak in hypothesis + significance vocabulary. They own the experimentation lane proper.
- **ISB (Information Strategy Board)**: source of truth for stakeholder identification on any given surface. Always identify ISB stakeholders before launching.
- **ZYS board** (visibility surface): needs to be accessible to everyone — broadcasting roadmap broadly is part of conflict prevention.
- **Experimentation Chapter / CoE**: arbiter when Sales-push and VS lanes contest the same surface.

## 7. Common Q&A patterns (highest-leverage section)

From `Q&A Expérimentation.pdf` (LH-internal, 13 pages, in French + English mix). Below are the canonical Q&A patterns Carter should be able to answer-back.

### Process questions

**Q: What are the steps of an A/B test?**
A: 5 steps: Ideation & Preparation (Trackspace ticket) → Validation (experiment team review) → Communication (Collab Hub post) → Publishing & Monitoring (DA publishes, product team monitors) → Take Action (document in repository). [Q&A p.5]

**Q: Where can I suggest an experiment idea outside my scope?**
A: Upload via the Trackspace form (Service Desk portal 9, request type 218) and reach out to a core team member to redirect to the right owner. [Q&A p.7]

### Tool questions (the A/B testing platform-specific — substitute your tool name if surfacing to other tenants)

**Q: How do I request access to the A/B testing platform?**
A: Fill the Trackspace form at the Service Desk portal 9, request type 223. [Q&A p.6]

**Q: Where can I conduct experiments?**
A: As of June 2025: almost all desktop internal pages (if Tealium tracking is implemented, the A/B testing platform is implemented by default). WebViews work. Native pages via Firebase, the A/B testing platform implementation ongoing. Email and marketing pages NOT supported. [Q&A p.6]

**Q: How do I limit traffic for a specific experiment (e.g., 40%)?**
A: Use Disjoint Groups in the "Who" section. Add a Disjoint Group condition with value matching your % (e.g., 4 = 40%). Inside that 40%, set even 50/50 split between variants. Uneven splits like 90/10 distort results and reduce accuracy. [Q&A p.9]

**Q: How do I set up a market/country-specific experiment?**
A: In the "Who" section → Landing → custom variables → select language or market. Values like "en"/"de" go in language variable. [Q&A p.9]

**Q: Why can't I see the the A/B testing platform preview in Chrome?**
A: Chrome blocks third-party cookies. Open the preview in Incognito (temporarily allows third-party cookies). On Edge with strict tracking, switch to Chrome or disable tracking prevention. [Q&A p.10]

**Q: My experiment is live but I see the CONTROL variant — can I delete the mt.v cookie to fall into Variant A?**
A: NO. Use incognito mode. the A/B testing platform uses `utag.data.tealium_visitor_id` as a stable identifier across cookie clears. [Q&A p.11]

### Visibility & alignment questions

**Q: How can I see all A/B tests live now that might affect my scope?**
A: Visit the Trackspace Portfolio Plan View (the experimentation roadmap). [Q&A p.7]

**Q: Where do I post before going live?**
A: The Experimentation Collab Hub Teams channel. You communicate twice: before go-live on Collab Hub + mention at the "talk about experimentation" meeting, AND comment on your team's post at test conclusion to share findings. [Q&A p.7]

**Q: Where can I find past test results?**
A: Two places: the 2-minute video gallery showing tests that went live, OR the Experimentation Repository in Docspace (templated entries for every documented test). [Q&A p.7]

### Theory questions

**Q: What's the difference between MVT, experimentation, and A/B test?**
A: A/B testing splits traffic between two or more versions of a webpage. MVT is a form of experimentation that varies multiple sections of a webpage simultaneously and tests all combinations of those variations. [Q&A p.8]

**Q: Why should I document my test results even if no significance was reached or the feature won't ship?**
A: Four reasons: learn from successes and mistakes, prevent misinterpretations, avoid results getting lost in email chains, give visibility. Use the dedicated Docspace repository with the "Experimentation Result" template. [Q&A p.8]

**Q: How do I define my goal metric?**
A: Use Microsoft's STEDII framework based on Ron Kohavi's work: Sensitivity, Trustworthiness, Efficiency, Debuggability, Interpretability & Actionability, Inclusivity & Fairness. [Q&A p.8]

### Reliability concerns

**Q: Can ad blockers and extensions bias test results?**
A: No. the A/B testing platform only activates when there's no ad blocker AND cookies are accepted. Randomization happens after activation, so all variants are seen by the same type of users — eliminating that source of bias. [Q&A p.13]

**Q: How do you ensure the A/B testing platform is correctly implemented and free from bias?**
A: We regularly run A/A tests — comparing two identical versions — to confirm no significant performance difference and verify the platform is implemented correctly. [Q&A p.13]

**Q: I see uneven traffic split despite 50/50 allocation in setup. Why?**
A: Almost always action-condition mismatch: one variant's action has a blank condition (so it fires everywhere) while another variant has a specific page-type condition (e.g., only on TRAVELER page). Fix the action conditions to match. [Q&A p.13]

**Q: the A/B testing platform doesn't load on UAT/QA but works on PROD — and I've accepted cookies and have no ad blocker. Why?**
A: By default the A/B testing platform doesn't auto-load in non-PROD. You need to toggle the localStorage flag via the bookmarklet (see "the A/B testing platform Script Control on UAT/QA Environments" doc). [Q&A p.13]

**Q: Can I analyze a test's results solely on Google Analytics (GA4)?**
A: No — no result gathered in GA4 or outside the A/B testing platform can be used to make decisions (no significance computation). GA4 results are only useful as supplementary insight into user behavior trends, not decision-making. [Q&A p.12]

## 8. Industry benchmarks (Booking.com)

Edgar Cano et al., March 2026, "Scaling Experimentation Quality at Booking.com" (Booking.com ML & DS Blog).

### Scale

> "At any given moment, we run approximately 1,000 parallel experiments to evaluate product changes." — Booking.com, p.1

### Quality bar — the 3-pillar Experimentation Quality (EQ) metric

1. **Design** — e.g., power calculations performed
2. **Execution** — e.g., runtime adherence (did the test run for the planned duration?)
3. **Decision** — e.g., alignment of the shipped decision with the original hypothesis

This was integrated into their in-house tool ("ET" / Experiment Tool) as a Quality Tab next to every experiment.

### The damning baseline finding

> "Initial data revealed where the biggest problems with experimentation quality lie. For example, 80% of experiments did not have a power calculation." — Booking.com, p.3

### Their four-part "make it" intervention model

1. **Make it obvious** — Quality Tab inside the tool that highlights violations + how to fix
2. **Make it easy** — Power Menu showing runtime/effect-size tradeoff
3. **Make it automatic** — opt-in automatic power calculation after a burn-in period
4. **Make it the default** — strong defaults at A/B test creation; default views show only pre-registered decision data (peeking-resistant)

### Their enforcement vs. education debate (verbatim, citation-ready)

> "When deciding how to scale quality, we faced a fundamental choice: Do we enforce strict controls or we rely on education. Ultimately, we left it to product teams to decide how to conduct their experiments." — Booking.com, p.2

> "However, until a few years ago, this flexibility led to a lack of reporting on the quality of experiments. We had no systematic tracking, governance, or assessments of statistical validity." — Booking.com, p.2

### Their three community programs (mirror LH's Champion model)

- **Experiment Bashes** — decision-makers review past experiments: What did we expect? What did we learn? How valid are the results?
- **Experiment Reviews** — small groups review randomly chosen experiments end-to-end
- **Experiment Ambassadors** — experimentation enthusiasts embedded in product teams (≈ LH's Champions)

### Key Coach-usable quotes (challenging weak inputs)

> "Experimenters might set an arbitrary 'two-week' duration without thinking about sufficient power, or extend a test until results 'became significant' or 'trended positive.' Knowing that this lack of consistency leads to flawed decision-making..." — Booking.com, p.2

> "With high-quality experimentation, we ensure trustworthy results. We ship the better features to our customers and use reliable experiment learnings to steer our product strategy in the right direction." — Booking.com, p.7

## 9. Hackathon context

The "Hackathon d'Expérimentation" PDF is a one-page image-only slide titled **"Experimentation Structure – Center of Excellence & Champion"**. It is a structural diagram, not a hackathon-event recap. It shows two operating-model archetypes:

### Top: DECENTRALIZED model
- Central "Experimentation Platform + Chapter" (Know-how) connects via dashed lines to multiple value streams: ISB, ANC, "(Same all VS)"
- Each VS has multiple DA (Data Analyst) nodes directly attached
- The Chapter is the central know-how hub but does not embed inside the VS

### Bottom: CHAMPIONS model
- Same "Experimentation Platform + Chapter" but now connected via solid lines to a Champion node inside each VS
- The Champion sits between the Chapter and the DAs in each value stream
- The yellow boundary explicitly groups the Chapter + the Champions as one continuous "Know-how" layer

### Sidebar bullets (left side of PDF)

> "Shifting the Experimentation Structure Support will create excellence within each value streams. People that will be the goto person for AB testing questions within their team. Enabling scale"

- High specialization and high productivity
- Increased Exp knowledge share and upskilling
- Consistent practices/processes
- Balance between flexibility and efficiency

### Why this matters for Carter

This is the operating-model context — the Champion is the human that Carter augments. When Carter responds to a question, it should know it is one of several touchpoints; the Champion is the embedded human in each VS, the Chapter is the central knowledge owner, and Carter is the always-on scaling layer that lets one Chapter + a handful of Champions cover 60+ teams. The hackathon framing matters because this diagram appears to be the artifact produced/refined during one of the experimentation hackathons that helped shape the program's operating model.

## 10. Useful quotes (verbatim, for citation)

> "I don't get to do experiments. I get to make other people do experiments. That's a completely different job." — Podcast Outline, §2 (Brice Koenig)

> "Don't Know, Can't Do, Don't Trust. If you don't diagnose which one you're dealing with, you'll spend six months solving the wrong problem." — Podcast Outline, ch.1 (Brice's team-maturity diagnostic)

> "You don't scale experimentation by hiring more experimenters. You scale by embedding someone in every team who speaks both languages — the language of the product and the language of evidence." — Podcast Outline, ch.1

> "When a test can affect operations in 200 airports, you don't get to just ship and see what happens. That forces you to be rigorous — and honestly, the methods we built because of that rigor are better than what I see in companies where anything goes." — Podcast Outline, ch.2

> "Never ask for more resources first. That should be the last thing you try, not the first." — Podcast Outline, ch.3

> "Every answer must be a link. That's been my rule since before GPT existed. If someone asks you a question and you answer in a chat message, that knowledge dies in the conversation. If you answer with a link to a document, it lives forever." — Podcast Outline, ch.3

> "Conversion is your language. Revenue is their language. Speak theirs." — Podcast Outline, Golden Nugget

> "The analyst running the test is responsible for its execution and timing. No conclusions should be drawn by anyone else." — Experimentation Ways of Working v26.pdf, p.6

> "It's commonly agreed that setting acceptable drop limits in conversion is essential. The analogy of creating a fence around a school illustrates this well; we need clear boundaries (walls) and specific play areas (limits for each experimentation)." — Experimentation Ways of Working v26.pdf, p.10

> "Si la baisse relative dépasse 5% sur le BCR, c'est 'bold'; 2%, 'safe'; 1%, 'extra safe'." [Paraphrased from "I suggest considering one of the following BCR drop as thresholds: 5% (bold) / 2% (safe) / 1% (extra safe)"] — Experimentation Ways of Working v26.pdf, p.10

> "Keep in mind that no result gathered within GA4 or outside the A/B testing platform can be used to take decisions, because there would be no significance." — Q&A Expérimentation.pdf, p.12

> "Le peeking est le biais créé par les utilisateurs en regardant des résultats non significatifs pendant qu'un test est encore live. Cette action impactera les décisions prises par la suite." [English gloss: "Peeking is the bias created by users when looking at non-significant results while a test is still live. This action will impact the decisions taken afterward."] — Experimentation Ways of Working v26.pdf, p.7

> "If a test is designed to impact a specific metric, anyone enrolled to monitor that metric should receive an automatic alert when the test launches." — DRAFT_01 (Ron Kohavi paraphrase)

> "An undocumented experiment is a sunk cost. You ran the test, you spent the traffic, but if nobody can find the results six months later, you will run the same test again." — DRAFT_01

> "The number of possible interactions grows exponentially with the number of concurrent experiments. Governance scales linearly. Invest in governance before you invest in more tests." — DRAFT_06

> "Parallel experimentation is a feature of mature programs, not a bug." — DRAFT_10

> "At any given moment, we run approximately 1,000 parallel experiments to evaluate product changes." — Booking.com (Cano et al., 2026)

> "80% of experiments did not have a power calculation." — Booking.com (Cano et al., 2026)

> "AI in experimentation is not about replacing statisticians or automating decisions. It's about reducing cognitive load for the people who actually run tests day to day." — DRAFT_02

> "Tenets of smooth Commercial testing: Performing the right tests + Performing tests correctly." — Comment améliorer le Stakeholder Map (1).pdf [original in English on a French-titled document]

## 11. Conflicts / gaps

### DRAFT_06 vs DRAFT_10 — same topic, different stances

These are clearly two alternative drafts of the same article. Synthesis:

| Dimension | DRAFT_06 ("collision-first") | DRAFT_10 ("parallelism-as-goal") |
|---|---|---|
| Opening framing | "Things break" when 3+ teams test on one surface | "Running parallel experiments is not a problem. It is the goal." |
| Stance on overlap | Treats overlap as a default risk | Treats overlap as the expected operating mode |
| Stance on saying no | More willing to gate: "the second team should wait" | Frames waiting as a queue-killer: "you have just created a queue that kills your velocity" |
| Solution emphasis | All three solutions presented equally | Explicitly says mutex audiences should be used "selectively for experiments that genuinely conflict, not as a blanket policy" |
| Tone | Risk/governance | Velocity/enablement |

Both drafts converge on the same three conflict types, the same three solutions, and the same five governance rules. The disagreement is the opening reframe. **For Carter: lead with DRAFT_10's framing (parallelism is the goal) but cite DRAFT_06's three-conflict taxonomy. They are complementary, not contradictory.**

### Concepts hinted at but not detailed

- **STEDII metric framework** (Q&A p.8) — referenced but not defined in any of the read sources. Need a separate extraction from the Champion Framework or related docs.
- **The "ISB" and "ANC" value streams** — referenced in the Hackathon diagram and Stakeholder Map but never defined in-source. Likely need a separate org-context extraction.
- **The ZYS board** — referenced in Stakeholder Map as a visibility surface but never defined.
- **The "Talk about Experimentation" meeting** — referenced in Q&A as a forum where teams pre-announce tests, but no agenda or cadence given.
- **Layered experimentation platform support at LH** — DRAFT_06/10 mention Booking.com / Google / Microsoft use it; nothing in the LH sources confirms whether the A/B testing platform at LH supports layered experimentation natively. Carter should not assume it does.
- **The Champion training curriculum** — Podcast Outline says "25+ hours of training" but no source extracted here details what's in those hours.
- **5 tenants × markets matrix** — confirmed the 5 airlines exist; the actual market split per airline / shared-vs-tenant-specific surface map is not in these sources.

### Where the Ways of Working v26 PDF and DRAFT_01 mildly disagree

- **Duration**: DRAFT_01 says "2 weeks to 1 month" as recommended duration; Ways of Working v26 says "If Significance Between 2 Weeks and 1 Month: Ensure at least 5 days under confidence interval and 10,000 sessions" and "If No Significance Within 1 Month: Stop the test." Both agree on the 1-month upper bound but Ways of Working is stricter on the early-stop conditions (5 days under CI + 10k sessions). **Carter should use Ways of Working as the source of truth for LH.**
- **Process phases**: DRAFT_01 uses 6 phases. Ways of Working/Q&A use 5 steps. Map: Planning+Communication+Pre-Live → "Ideation & Preparation"; Pre-Live → "Validation"; Communication → "Communication"; Go-Live+During → "Publishing & Monitoring"; Conclusion → "Take Action". No real conflict, just labeling.

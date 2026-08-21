---
title: Hypothesis Quality — Knowledge Base
sources:
  - "A_B Testing Hypothesis Evaluation Playbook-v3-20260415_111110.pdf": Digital Hangar @LHG playbook, 10 pages — template, 6-dimension framework, validation prompt, gold example
  - "Hypothesis Coach V0.pdf": Earlier coaching artifact; content-identical to the v3 playbook (same Digital Hangar @LHG doc). Use the v3 PDF as the canonical citation.
  - "What Makes a Good AB Test.md": Brice's synthesised criteria — hard requirements, quality signals, red flags, hypothesis standards
  - "Experiment Quality Scoring Framework.md": LH scoring framework v1.0 (note: prompt v1 refers to v1.1; treat as same framework) — Thomke 6-dimension hypothesis rubric with per-dimension point allocations
  - "coach/src/prompts/hypothesis-dimension-1-source/v1.md": Current Coach rubric for Source dimension (cross-reference only)
last_extracted: 2026-05-27
extracted_by: subagent (Coach knowledge swarm)
---

# Hypothesis Quality

## 1. What makes a good hypothesis (synthesis)

A good A/B test hypothesis is **specific, falsifiable, evidence-grounded, and tied to business impact**. The canonical structure used at LHG is built around five required slots and evaluated on Thomke's six dimensions.

**Must-haves:**

- **Follows the standard template** with all five slots populated: specific element, specific scope, goal metric, specific percentage, invariant metric [source: Experiment Quality Scoring Framework.md, Stage 3A; A_B Testing Hypothesis Evaluation Playbook, p.4].
- **Grounded in observable evidence** — qualitative research, customer insights, analytics/data mining, or competitor analysis; not opinion or intuition [source: A_B Testing Hypothesis Evaluation Playbook, p.5; What Makes a Good AB Test.md, Quality Signals].
- **Cause and effect explicitly named** — independent variable (what changes) and dependent variable (what is measured) [source: Experiment Quality Scoring Framework.md, Dimension 2; What Makes a Good AB Test.md, Hypothesis Standards].
- **Falsifiable prediction with a specific number, scope, and timeframe** — e.g., "CTR will increase by at least 3% within 14 days for homepage visitors" [source: Experiment Quality Scoring Framework.md, Dimension 3].
- **Quantifiable primary metric** that is normalised per user where applicable [source: What Makes a Good AB Test.md, Metric & Measurement Standards].
- **Replicability** — design is documented (randomisation, audience, variant) such that another team could reproduce the test [source: Experiment Quality Scoring Framework.md, Dimension 5].
- **Business motivation explicit** — link to revenue / approved KPI, ideally as a range using the lower bound of the CI [source: Experiment Quality Scoring Framework.md, Dimension 6].
- **User problem must be understood before a hypothesis is written.** If the team cannot articulate the user problem, do user research first [source: Experiment Quality Scoring Framework.md, Stage 3A hard-block note].
- **Pre-registered** — hypothesis and primary metric are locked before data collection [source: What Makes a Good AB Test.md, Hard Requirements].

### Thomke's 6-Dimension Framework (canonical list)

Per Stefan Thomke's *Experimentation Works*, recreated verbatim in the playbook [source: A_B Testing Hypothesis Evaluation Playbook, p.6]. Point allocations from LH scoring framework [source: Experiment Quality Scoring Framework.md, Stage 3A]:

| # | Dimension | Strong | Weak | LH Points |
|---|-----------|--------|------|-----------|
| 1 | **Source** | "Qualitative research, customer insights, problems, observations, data mining, competitors" | "Guesses not rooted in observations or facts" | 5 |
| 2 | **Variables** | "Identifies possible cause and effect" | "Possible cause or effect unknown" | 5 |
| 3 | **Prediction** | "Can be shown to be false" | "Difficult to disprove, vague" | 5 |
| 4 | **Measurement** | "Quantifiable metrics" | "Qualitative outcomes" | 3 |
| 5 | **Verification** | "Experiment (with hypothesis) can be replicated" | "Difficult to repeat experiment" | 3 |
| 6 | **Motivation** | "Clear impact on business outcomes" | "Link between metric and business impact unclear" | 4 |

Total Hypothesis Quality Score: **25 points**. Hard block if < 15/25 [source: Experiment Quality Scoring Framework.md, Decision rules].

---

## 2. Anti-patterns / weak hypothesis signals

- **Vague aspirational statements** — "improve user experience", "make it better", "increase engagement" without definition [source: What Makes a Good AB Test.md, Red Flags; Experiment Quality Scoring Framework.md, Red Flags Checklist].
- **No data source** — guesses not rooted in observation, "we feel", "leadership says", "best practices suggest", "competitors do X" [source: A_B Testing Hypothesis Evaluation Playbook, p.6; coach/src/prompts/hypothesis-dimension-1-source/v1.md].
- **Cause or effect unknown** — "Improve the page" (what aspect? measured how?) [source: Experiment Quality Scoring Framework.md, Dimension 2 score 1].
- **Unfalsifiable prediction** — "We will learn something", "user experience will improve" [source: Experiment Quality Scoring Framework.md, Dimension 3 scores 1–2].
- **Qualitative outcomes only** — no quantifiable metric [source: What Makes a Good AB Test.md, Red Flags].
- **Brand-extension / strategic-claim style** — Thomke's canonical weak example: "We can extend our brand upmarket" [source: A_B Testing Hypothesis Evaluation Playbook, p.6].
- **Loose metric definition** — e.g., "engagement" without specifying what counts [source: Experiment Quality Scoring Framework.md, Dimension 4 score 2].
- **Multiple primary metrics / "we'll look at everything"** — separate failure mode but often co-occurs with weak hypotheses [source: What Makes a Good AB Test.md, Hard Requirements].
- **Hypothesis doesn't follow the template** — capped at 10/25 regardless of dimension scores [source: Experiment Quality Scoring Framework.md, Stage 3A].
- **No business connection** — "this will help conversion" with no link to an approved KPI [source: Experiment Quality Scoring Framework.md, Dimension 6 score 2].

---

## 3. Source-grounding examples (strong vs weak)

### Strong examples

1. > "By changing the call-to-action button from blue to green, we expect to increase the click-through rate by 3% over the next two weeks without impacting page load time. We will measure this using the A/B testing platform, and the test will target users on the homepage only."
   — *A_B Testing Hypothesis Evaluation Playbook, p.9 (Section 6 — Example of a Good Hypothesis)*. This is the gold canonical example. Note caveat in Section 7.

2. > "Opening our stores one hour later has no impact on daily sales revenue."
   — *A_B Testing Hypothesis Evaluation Playbook, p.6, citing Stefan Thomke, Experimentation Works*. Demonstrates falsifiability via a null prediction.

3. Template-instantiated strong: "We believe that by changing the color of the call-to-action button, we will increase the click-through rate (CTR) for the homepage CTA button by at least 3% without impacting page load time." [source: A_B Testing Hypothesis Evaluation Playbook, p.4].

4. Composite strong (from criteria synthesis): "CTR will increase by at least 3% within 14 days for homepage visitors." — meets specific %, specific timeframe, specific scope (the 5/5 anchor for Prediction) [source: Experiment Quality Scoring Framework.md, Dimension 3 score 5].

### Weak examples

1. > "We can extend our brand upmarket."
   — *A_B Testing Hypothesis Evaluation Playbook, p.6, citing Stefan Thomke*. Canonical weak example: not falsifiable, no metric, no scope.

2. "Improve the page." — Variables dimension score 1: cause or effect unknown [source: Experiment Quality Scoring Framework.md, Dimension 2 score 1].

3. "User experience will improve." — Prediction dimension score 2: vague directional prediction, not measurable [source: Experiment Quality Scoring Framework.md, Dimension 3 score 2].

4. "We will learn something." — Prediction dimension score 1: not falsifiable [source: Experiment Quality Scoring Framework.md, Dimension 3 score 1].

5. "We think this might work." — Source dimension score 1: pure guess, no data source of any kind [source: Experiment Quality Scoring Framework.md, Dimension 1 score 1].

6. "We noticed users struggle" with no specific research cited — Source dimension score 3: references data but vaguely [source: Experiment Quality Scoring Framework.md, Dimension 1 score 3].

---

## 4. Falsifiability criteria

A hypothesis is falsifiable when there exists a specific empirical observation that would prove it wrong [source: A_B Testing Hypothesis Evaluation Playbook, p.6 — "Can be shown to be false"].

LH operationalises falsifiability as the **Prediction dimension** (5 points), requiring three specifics [source: Experiment Quality Scoring Framework.md, Dimension 3]:

- **Specific percentage** (the MDE / expected lift)
- **Specific timeframe** (typically implied by planned duration)
- **Specific scope** (page, segment, surface)

Scoring anchors:

- **5/5:** "CTR will increase by at least 3% within 14 days for homepage visitors." (% + timeframe + scope)
- **3/5:** "CTR will increase." (directional + scope, no specific %)
- **2/5:** "User experience will improve." (vague directional)
- **1/5:** "We will learn something." (not falsifiable)
- **0/5:** No prediction stated.

Supporting requirements that make falsifiability operationally enforceable:

- **One primary metric per test.** "Tracking 10 metrics at p=0.05 gives a ~40% chance of at least one false positive. Pick one." [source: What Makes a Good AB Test.md, Hard Requirements].
- **Sample size calculated upfront** using a power calculator with baseline conversion rate, MDE, and daily traffic [source: What Makes a Good AB Test.md, Hard Requirements].
- **Pre-registration** — hypothesis and success metric locked before data collection [source: What Makes a Good AB Test.md, Hypothesis Standards].

Key quote:

> "A hypothesis without a clear metric and a falsifiable prediction is not a hypothesis. It's a wish."
> — *DRAFT_01, quoted in What Makes a Good AB Test.md*

---

## 5. The hypothesis template / canonical form

### Primary template (LHG playbook v3, 15 April 2026)

> "We believe that by changing **[specific element, e.g., 'the color of the call-to-action button']**, we will increase **[goal metric, e.g., 'the click-through rate (CTR)']** for **[specific metric, e.g., 'the homepage CTA button']** by **[specific percentage, e.g., 'at least 3%']** without impacting **[invariant metric, e.g., 'page load time']**."
> — *A_B Testing Hypothesis Evaluation Playbook, p.4*

Five required slots: **specific element, goal metric, specific scope, specific percentage, invariant metric** [source: A_B Testing Hypothesis Evaluation Playbook, p.4; Experiment Quality Scoring Framework.md, Stage 3A].

### Variation in `What Makes a Good AB Test.md`

"We believe that by changing [specific element], we will increase [goal metric] by [specific percentage] without impacting [invariant metric]." [source: What Makes a Good AB Test.md, Hard Requirements]

Note: this variation **drops the explicit "for [scope]" slot**; the scope slot is reintroduced in the longer template under "Hypothesis Standards" in the same file. The full 5-slot template is the canonical one.

### Compliance rule

If the hypothesis does not follow this structure, the **Hypothesis Quality Score is capped at 10/25 regardless of dimension scores** [source: Experiment Quality Scoring Framework.md, Stage 3A].

---

## 6. Useful quotes (verbatim, for citation)

> "A hypothesis without a clear metric and a falsifiable prediction is not a hypothesis. It's a wish."
> — *What Makes a Good AB Test.md, citing DRAFT_01*

> "Pre-register your hypothesis and success metric. No changing the goalpost after seeing results. This is the single most important governance rule."
> — *What Makes a Good AB Test.md, DRAFT_01 Golden Rules*

> "No significance, no go-live."
> — *What Makes a Good AB Test.md, DRAFT_01 Golden Rules*

> "A 2% uplift that isn't significant is not a 2% uplift. It's noise."
> — *What Makes a Good AB Test.md, DRAFT_01 Golden Rules*

> "Stop saying 'successful' and 'failed' experiments. Start saying 'hypothesis validated,' 'hypothesis not validated,' and 'no significant difference.' This is not a semantic game. It is a governance transformation that separates strategic programs from theatrical ones."
> — *What Makes a Good AB Test.md, DRAFT_09*

> "Qualitative research, customer insights, problems, observations, data mining, competitors" — strong hypothesis source. "Guesses not rooted in observations or facts" — weak hypothesis source.
> — *A_B Testing Hypothesis Evaluation Playbook, p.6, citing Stefan Thomke, "Experimentation Works"*

> "Can be shown to be false" — strong hypothesis prediction. "Difficult to disprove, vague" — weak hypothesis prediction.
> — *A_B Testing Hypothesis Evaluation Playbook, p.6, citing Stefan Thomke*

> "Opening our stores one hour later has no impact on daily sales revenue." (strong) vs. "We can extend our brand upmarket." (weak)
> — *A_B Testing Hypothesis Evaluation Playbook, p.6, citing Stefan Thomke*

> "By changing the call-to-action button from blue to green, we expect to increase the click-through rate by 3% over the next two weeks without impacting page load time. We will measure this using the A/B testing platform, and the test will target users on the homepage only."
> — *A_B Testing Hypothesis Evaluation Playbook, p.9 (gold example)*

> "If you cannot clearly articulate what you will learn from this test regardless of the outcome, you are not ready to run it."
> — *What Makes a Good AB Test.md, DRAFT_01*

> "Your role is to evaluate my draft hypothesis by comparing it against the framework provided below. You will help me to think through my theory and logic, where necessary, by asking insightful questions. Don't be verbose. Your tone is helpful, but strict."
> — *A_B Testing Hypothesis Evaluation Playbook, p.6 (the original Coach prompt — tone reference)*

> "If the problem is not understood, do user research first. You cannot test a solution to a problem you do not understand."
> — *What Makes a Good AB Test.md, Hard Requirements*

> "When a test can affect operations in 200 airports, you don't get to just ship and see what happens."
> — *What Makes a Good AB Test.md, Podcast Outline*

---

## 7. Conflicts / gaps

### Conflicts and ambiguities between sources

1. **"specific metric" vs. "specific scope" slot label.** The playbook template (p.4) uses the slot label *"for [specific metric, e.g., 'the homepage CTA button']"* — but the example given is a **scope** (a UI element/page), not a metric. The Scoring Framework correctly relabels this slot as **specific scope**. The Coach should treat this slot as **scope**, not metric, and may want to flag the playbook's mislabel. [Sources: A_B Testing Hypothesis Evaluation Playbook, p.4 vs. Experiment Quality Scoring Framework.md, Stage 3A.]

2. **Gold example is partially compliant with its own template.** The p.9 example ("blue to green ... 3% ... two weeks ... homepage only") is strong on Prediction (5/5) and Variables, but the playbook itself does not state the data **source** behind the colour change — a hypothesis grounded in "blue → green" with no cited evidence would score low on Dimension 1 (Source). The Coach should not treat the canonical example as a 25/25 hypothesis. [Source: A_B Testing Hypothesis Evaluation Playbook, p.9.]

3. **Source rubric mismatch with current Coach prompt.** The Scoring Framework (Stage 3A, Dimension 1) treats a single strong source with specific citations as **4/5**. The current Coach prompt at `coach/src/prompts/hypothesis-dimension-1-source/v1.md` requires **"two or more distinct evidence sources"** for 5/5 — stricter than the framework, which says "multiple data sources: qual research + quant data + competitor analysis." The prompt's stricter ceiling is defensible but is a **divergence** worth flagging. The framework allows the playbook list (qual research / customer insights / data mining / competitors) as acceptable; the prompt v1 explicitly excludes competitor analysis ("Treat 'competitors do X' as opinion-class, not evidence"). [Sources: coach/src/prompts/hypothesis-dimension-1-source/v1.md, lines 19–40 vs. Experiment Quality Scoring Framework.md, Dimension 1; A_B Testing Hypothesis Evaluation Playbook, p.6.]

4. **Template variants disagree on slot count.** Three different framings appear: (a) playbook 5-slot with the "specific metric/scope" label issue; (b) `What Makes a Good AB Test.md` Hard Requirements 4-slot (no scope); (c) same file Hypothesis Standards 5-slot. The 5-slot template (element / scope / metric / % / invariant) is the de-facto canonical form because it matches the scoring framework's binary template check. [Sources cited above.]

5. **Scoring framework version.** The prompt v1 cites "v1.1" of the Experiment Quality Scoring Framework; the file in the repo is **v1.0** (2026-05-27). Treated as the same framework, but the version-numbering drift should be reconciled. [Sources: Experiment Quality Scoring Framework.md, header; coach/src/prompts/hypothesis-dimension-1-source/v1.md, line 5.]

### Gaps (concepts hinted at but not fully covered)

- **What counts as "quantified" for Source dimension** is under-specified. The prompt v1 demands "n=, %, dates, IDs" but the framework only says "specific findings"/"specific citations." Coach behaviour here is governed by the prompt, not the source docs.
- **Verification dimension** is thinly defined in all sources — playbook reduces it to "random assignment to control/variant groups is feasible" (p.5), framework adds "randomisation method, audience definition, variant description are explicit" (Dimension 5). No worked examples exist; this is the weakest-developed dimension.
- **Motivation dimension and revenue-range estimation** are described at scoring-rubric level but no worked example exists in the playbook. The Coach will need synthesised examples if it is to score this dimension well.
- **Thomke's original framework** is cited but the source book (*Experimentation Works*) is not in the repo — quotes used here are second-hand via the playbook (p.6).
- **No examples of mid-quality (score 3) hypotheses** exist in the source PDFs — only strong vs weak. The framework provides anchor descriptions but no full-sentence example hypotheses for the middle range. Coach prompt-writers should commission these.
- **Hypothesis Coach V0.pdf and the v3 playbook are byte-identical content.** The "earlier coaching artifact" framing in the brief is misleading — there is no separate older version to compare against.

---
title: Methodology Selection (COMPASS + Alternatives)
sources:
  - "Testing Compass PRD (1) (3).pdf — Spec for the 7-question COMPASS decision tree and its 6 methodology outcomes (USER_RESEARCH, LO_FI_PROTOTYPING, FAKE_DOOR, AB_TEST, FEEDBACK_SURVEY, DO_NOT_TEST)."
  - "_Ancillary Pricing A_B Testing_ Switchback Experiment Framework-v9-20260415_110842.pdf — 10-step switchback design for ancillary pricing tests with Two-Way Fixed Effects regression."
  - "One-Tailed Testing Negative Impacts.pdf — When and how to run one-tailed tests in the A/B testing platform (manual stop + custom R analysis)."
  - "A_B Test Feasibility Guide_ Calculate Time to Significance-v3-20260415_111006.pdf — Booking.com Power Calculator workflow for feasibility / runtime estimation."
  - "DRAFT_08_Decision_Protocols.md — Pre-commit decision protocol framework (success thresholds, implementation criteria, action frameworks)."
  - "Tarification Test.pdf — Brice's deck framing the switchback methodology for ancillary pricing and the AAM operational unlock."
  - "Methodology_Confidence_to_Pluralsight.md — Onboarding restructure leaning on Spotify Confidence for stats backbone + LHG content for process / advanced designs."
last_extracted: 2026-05-27
extracted_by: subagent (Coach knowledge swarm)
---

# Methodology Selection

The Coach must recommend a methodology by walking the COMPASS decision tree first, then enriching the recommendation with traffic / risk / one-tailed considerations and (for pricing or other non-randomizable cases) the switchback alternative.

---

## 1. The COMPASS framework (the backbone)

The Testing Compass is a **gate-keeper** decision tree with **7 sequential Yes/No gates** that route a Product Owner or Business Analyst to one of **6 methodology outcomes**. It is designed to *prevent teams from jumping to expensive A/B tests without proper foundational validation* [source: Testing Compass PRD, p.1].

> "Key Principle: Gate-keeper model that prevents teams from jumping to expensive A/B tests without proper foundational validation." — Testing Compass PRD, p.1

### 1.1 The 7-gate flow (verbatim from the PRD)

```
START → Welcome
│
├─ Q1: "Do I understand perfectly the user problem?"
│    NO  → END: USER_RESEARCH
│    YES → Q2
│
├─ Q2: "Do I know what solution I want to test?"
│    NO  → END: LO_FI_PROTOTYPING
│    YES → Q3
│
├─ Q3: "Is this solution expensive/slow to build with unclear demand?"
│    YES → END: FAKE_DOOR
│    NO  → Q4
│
├─ Q4: "Do you have a well-formed hypothesis?"
│    NO  → END: DO_NOT_TEST
│    YES → Q5
│
├─ Q5: "Does this metric really mean anything & can we measure it?"
│    NO  → END: DO_NOT_TEST
│    YES → Q6
│
├─ Q6: "Is there any possible outcome that will change our actions?"
│    NO  → END: DO_NOT_TEST
│    YES → Q7
│
└─ Q7: "Can I reach significance in a reasonable timeframe?"
     NO  → END: FEEDBACK_SURVEY
     YES → END: AB_TEST
```
[source: Testing Compass PRD, pp.2–3]

### 1.2 Why each gate exists (Coach should explain these in the conversation)

- **Q1 (problem clarity).** If you can't articulate the user problem, no amount of testing will save you. Route to qualitative research before any solution work. [source: Testing Compass PRD, p.4]
- **Q2 (solution clarity).** If you have a problem but no candidate solution, you need to *generate and compare* directions before testing one — prototyping is cheaper than building. [source: Testing Compass PRD, p.4]
- **Q3 (cost vs. demand uncertainty).** When the build is expensive and demand is unproven, validate demand with a *fake door* before committing engineering. [source: Testing Compass PRD, p.5]
- **Q4 (hypothesis).** No hypothesis ⇒ no test. The PRD's `DO_NOT_TEST` brief sends the user back to refine the hypothesis. [source: Testing Compass PRD, p.6]
- **Q5 (metric).** Metric must be *meaningful AND measurable*. Either failure mode disqualifies the test. [source: Testing Compass PRD, pp.2,6]
- **Q6 (actionability).** If no result would change any action, the test is theatre. This is the "is there any possible outcome that will change our actions?" gate — a Kohavi-style actionability filter. [source: Testing Compass PRD, p.3]
- **Q7 (feasibility).** Even with everything else right, if you can't reach significance in a reasonable timeframe given your traffic, A/B is infeasible — fall back to a feedback survey. [source: Testing Compass PRD, p.3]

### 1.3 Methodology outcomes (type union from the PRD)

```ts
type MethodologyType =
  | "USER_RESEARCH"
  | "LO_FI_PROTOTYPING"
  | "FAKE_DOOR"
  | "AB_TEST"
  | "FEEDBACK_SURVEY"
  | "DO_NOT_TEST";
```
[source: Testing Compass PRD, p.3]

### 1.4 Coach extensions to COMPASS (not in PRD, but required for real recommendations)

The PRD's terminal `AB_TEST` outcome is under-specified for LHG's reality. Once Q7 lands on `AB_TEST`, the Coach should layer a **secondary methodology decision** using these branches (sourced from the other docs in this file):

- **Cannot randomize at user/session level** (e.g., pricing engine sets one price per route) → **Switchback** (see §2.6, §2.10) [source: Tarification Test, pp.5,8; Switchback Framework, p.3]
- **Goal is to detect harm only** (defensive launches: prominent login, required UX changes) → **One-tailed A/B** (see §5) [source: One-Tailed Testing, p.4]
- **Multiple changes that interact** → **MVT** (see §2.3)
- **Need to peek / make decisions fast under low traffic** → **Sequential testing** (see §2.4)
- **Want a permanent "did this really work" reference** → **Long-run holdout** (see §2.5)

---

## 2. Methodology catalog

### 2.1 A/B test (standard, two-tailed)

**When to use.** All 7 COMPASS gates passed `YES`; user/session-level randomization is possible; you can reach significance in a reasonable timeframe given baseline conversion, expected lift, and traffic. [source: Testing Compass PRD, pp.3,5]

**When NOT to use.** Any COMPASS gate fails; randomization unit is not the user (e.g., pricing); traffic is too low to detect the MDE in a sensible window.

**Traffic / runtime requirements.** PRD prerequisite: *"Sufficient traffic (>1000 users/week)"* [source: Testing Compass PRD, p.5]. Detailed runtime computed via the Booking.com Power Calculator from baseline, traffic, and lift (see §3).

**Risk profile.** Low if implemented correctly; primary risks are SRM, contamination, peeking. Pair with a decision protocol (§4) to avoid post-hoc rationalization.

**Mission brief next steps (verbatim).**
> "1. Define primary metric  2. Calculate sample size  3. Build variant  4. Run for 2-4 weeks  5. Analyze with confidence intervals" — Testing Compass PRD, p.6

### 2.2 A/B/n (multi-variant)

**When to use.** Two or more candidate variants of the *same change* (e.g., 3 banner copies). Traffic must split N+1 ways while still reaching significance per arm.

**When NOT to use.** Low traffic — the runtime scales roughly linearly with the number of arms because each arm needs its own sample. PRD does not formally call out A/B/n; treat it as A/B with a feasibility recheck. [gap: not explicitly named in sources]

### 2.3 MVT (multivariate)

**When to use.** Multiple independent factors changing simultaneously, and you specifically want to estimate *interaction effects* between them.

**When NOT to use.** Low traffic; you only care about the combined effect (run a standard A/B of the combined treatment instead). Not covered in the LHG source docs — flag as gap. [gap: not in sources]

### 2.4 Sequential testing

**When to use.** You want valid inference while peeking, or you want to stop early when an effect is overwhelming. Covered in Spotify Confidence's stats backbone, which LHG now leans on for the DS track. [source: Methodology_Confidence_to_Pluralsight.md, §DS4]

> "Group sequential testing vs always-valid confidence sequences. When to peek at results. Early stopping rules. The cost of peeking without correction." — Methodology_Confidence_to_Pluralsight.md, §DS4

**When NOT to use.** When the platform (e.g., the A/B testing platform) does not natively support always-valid CIs and the analyst will not run a custom analysis. Naive peeking without correction inflates Type I error.

### 2.5 Holdout

**When to use.** After shipping a feature, keep a small population on the old experience to measure long-run incremental impact. Confidence-style "exclusive experiments" and layered experimentation concepts cover this. [source: Methodology_Confidence_to_Pluralsight.md, §DS5]

**When NOT to use.** Short-lived features; low traffic that can't afford a permanent holdout. [gap: holdout details not in sources]

### 2.6 Switchback (the LHG flagship for non-randomizable cases)

**When to use.** Randomization unit is not the user (most commonly **ancillary pricing at route level**). LATAM's airline-scale validation cited; standard A/B fails because the pricing engine cannot be reached by the A/B testing platform (which sits on the .com frontend).

> "the A/B testing platform (our AB Testing tool) operates on the .com frontend and cannot reach the backend pricing engine. Standard A/B testing is therefore not viable for pricing policies." — Switchback Framework, p.3

> "The Usual Way: Randomisation at Session Level. Our Situation: Prices Set at route level. Every user see the same price. If we cannot randomize at session level We can randomize at route level." — Tarification Test, p.5

**When NOT to use.** User-level randomization is possible (just run an A/B); routes share a passenger pool (cross-route contamination breaks the design) [source: Switchback Framework, p.5].

**Traffic / runtime requirements.** Aim for **pods of 4-6 routes** each. **Weekly switching** is recommended (daily = highest precision but operationally heavy; bi-weekly = lower precision, only if demand response > 1 week). **Washout window: 1-2 days at every switch**. [source: Switchback Framework, pp.6-7]

**Risk profile.** High operational and analytical complexity (k-means clustering, balanced pods, locked schedule, treatment logs, panel build, TWFE regression, placebo + synthetic recovery tests). The operational blocker historically was Excel-based price changes; **AAM tooling now makes weekly per-route switching feasible** [source: Tarification Test, p.10].

**The 10-step backbone (verbatim section headers).**
1. Define the commercial hypothesis [p.5]
2. Select and validate experimental clusters [p.5]
3. Build balanced pods via k-means clustering [p.5]
4. Define switching cadence [p.6]
5. Lock and pre-register the switchback schedule [p.7]
6. Execute price switches and maintain treatment logs [p.7]
7. Build the route-day panel dataset [p.8]
8. Run the Two-Way Fixed Effects regression [p.9]
9. Validate results (placebo + synthetic uplift) [p.9]
10. Interpret (point estimate, 95% CI, go/no-go) [p.10]

**Regression spec.**
> "Y(i,t) = route fixed effect + time fixed effect + beta x Treatment(i,t) + error" — Switchback Framework, p.9

> "Python: use PanelOLS from the linearmodels package with EntityEffects + TimeEffects. R: use feols() from the fixest package with route + date fixed effects." — Switchback Framework, p.9

### 2.7 Fake-door / smoke test

**When to use.** Q3 of COMPASS triggered: *"this solution is expensive/slow to build with unclear demand."* Validate willingness via a landing page + signup form before committing engineering.

**When NOT to use.** Demand is already validated; the build is cheap (just run the A/B).

**Mission brief — required prerequisites.**
> "Landing page capability, Email collection tool, Marketing distribution channel" — Testing Compass PRD, p.5

**Decision threshold (heuristic from PRD).**
> "Measure conversion rate (>15% = proceed)" — Testing Compass PRD, p.5

### 2.8 Feedback survey (when traffic too low for A/B)

**When to use.** All COMPASS gates passed except **Q7 (feasibility)** — you cannot reach significance in a reasonable timeframe. Use qualitative signal instead. [source: Testing Compass PRD, p.6]

> "Method: Feedback AI Survey. Why: Cannot reach statistical significance; use qualitative input." — Testing Compass PRD, p.6

**Mission brief next steps.**
> "1. Draft 5-7 targeted questions  2. Recruit 50-100 respondents  3. Analyze sentiment patterns  4. Extract actionable insights" — Testing Compass PRD, p.6

**When NOT to use.** When you actually have the traffic — go run an A/B; qualitative is no substitute for causal evidence.

### 2.9 User research (Q1 fallback)

**When to use.** Problem understanding insufficient.
> "Why: Problem understanding is insufficient for solution testing." — Testing Compass PRD, p.4

**Next steps.** Recruit 8–12 users; user journey map; behavioural analysis; documented problem statement. [source: Testing Compass PRD, p.4]

### 2.10 Lo-fi prototyping (Q2 fallback)

**When to use.** Solution direction unclear — explore 2-3 wireframes with 5-8 users before building. [source: Testing Compass PRD, p.4-5]

### 2.11 Do-not-test (Q4/Q5/Q6 failure)

**When to use.** Missing critical prerequisites: well-formed hypothesis, measurable success metric, or pre-defined action triggers.
> "Why: Missing critical prerequisites (hypothesis/measurement/actionability)." — Testing Compass PRD, p.6

This is a *halt* outcome, not a methodology — Coach should help the user fix the missing prerequisite and re-enter the compass.

### 2.12 Pricing test (special case — Tarification Test deck)

**When to use.** Any ancillary pricing experiment at LHG. The deck makes the case explicit: standard A/B fails because the A/B testing platform cannot reach the backend pricing stack — use switchback instead.

> "DAP MVP Price exploration proved added value of dynamic Pricing… 100-day price exploration on ASR for LH, OS, SN, LX… Showed customers willingness to pay." — Tarification Test, p.6

> "Switchback: each route is its own control… 1 day washout between switches." — Tarification Test, p.8

**Operational dependency.** AAM (the new Ancillary Allotment Management tooling, after the KONDO unlock) is what made weekly per-route switching feasible. Before AAM: Excel-driven, *"Weekly switching per route: not feasible."* After AAM: *"Weekly switching per OND and flight date: Now feasible."* [source: Tarification Test, p.10]

---

## 3. Time to significance & power

### 3.1 The LHG workflow (Booking.com Power Calculator)

LHG uses the **Booking.com Power Calculator** for feasibility checks and runtime estimation. *"This tool was developed by Booking.com and may differ from computations provided by the A/B testing platform. However, it remains a relevant tool for feasibility checks and planning experiments."* [source: A/B Test Feasibility Guide, p.3]

**Inputs.**
1. **Test type** — "Base vs One Variant" [p.4]
2. **Metric type** — Binomial (preferred, e.g., conversion rate) or Continuous (e.g., average revenue) [p.4]
3. **Baseline metric (base rate)** — current value of the goal metric, e.g., 10% conversion
4. **Daily traffic** — expected daily visitors; tip: average over a 1-month window, not a single day
5. **Lift expectation (MDE)** — relative or absolute, e.g., ±2%. *"Industry Standard = 5%"* [p.4]
6. **Test duration (days)** — the tool outputs whether the test reaches significance in that window

**Output.** Visitors required and feasibility verdict. [source: A/B Test Feasibility Guide, pp.5-6]

### 3.2 Inputs cheat-sheet for the Coach

| Driver | Effect on runtime | Source |
|---|---|---|
| Higher baseline conversion (10% vs 1%) | Shorter runtime | p.4, p.7 |
| Higher daily traffic | Shorter runtime | p.4, p.7 |
| Larger expected lift | Shorter runtime | p.4 |
| Tighter MDE (e.g., 1%) | Significantly longer runtime, much larger sample | p.7 |

> "Tests with a higher baseline conversion rate (e.g., 10%) are more likely to achieve significance within a reasonable timeframe compared to tests with low rates (e.g., 1%)." — Feasibility Guide, p.7

> "Be realistic about the expected lift. Smaller lifts (e.g., ±1%) require significantly larger sample sizes and longer test durations." — Feasibility Guide, p.7

### 3.3 Common pitfalls

- **Peeking without correction.** Use sequential testing (Confidence's group-sequential / always-valid sequences) if you need to peek. [source: Methodology_Confidence_to_Pluralsight.md, §DS4]
- **Underpowering one-tailed tests.** Set the expected negative effect size realistically in the Power Calculator. [source: One-Tailed Testing, p.10]
- **Single-day traffic estimates.** Use a 1-month average to smooth weekday/weekend cycles. [source: Feasibility Guide, p.4]
- **Stopping early because results look good.** Pre-commit the sample size; let it complete (or use a designed sequential procedure).

---

## 4. Decision protocols (post-test)

**Pre-commit rule.** *"A decision protocol is a pre-commitment device. It eliminates post-hoc decision making by requiring teams to agree on what they will do for every possible outcome before they see any results."* [source: DRAFT_08_Decision_Protocols.md]

### 4.1 The three elements (verbatim)

1. **Success thresholds** — "What specific improvement levels justify different actions? Not just statistical significance, but business significance tied to strategic goals." [DRAFT_08]
2. **Implementation criteria** — "What additional factors must be considered alongside primary metrics? Secondary metric impacts, technical feasibility, resource requirements." [DRAFT_08]
3. **Action frameworks** — "Clear, predetermined responses to every possible outcome: positive, negative, inconclusive, or anywhere in between." [DRAFT_08]

### 4.2 Canonical outcome → action table (DRAFT_08 example, checkout flow)

| Outcome | Action |
|---|---|
| Conversion +5% with 90% confidence | Full rollout within 2 weeks |
| Conversion +2-5% | Implement with additional monitoring & feedback for 1 month |
| Improvement < 2% OR inconclusive | Return to user research |
| Conversion decreases | Immediately test an alternative within 1 month |

Plus a **guardrail clause**: e.g., "if support inquiries +15%, even a positive primary triggers a modified rollout." [source: DRAFT_08]

### 4.3 The three forces that make post-hoc decisions unreliable (verbatim)

- **Emotional contamination.** *"Once results are visible, rational evaluation becomes nearly impossible."*
- **Retrospective rationalization.** *"Business contexts and priorities inevitably shift during experiment cycles."*
- **Stakeholder politics.** *"When decisions wait until after results, they become political rather than scientific."*
[source: DRAFT_08]

### 4.4 Lock the protocol at planning, not at results time

> "Before go-live. The protocol is locked. No modifications once data collection starts. This is the equivalent of pre-registration in academic research." — DRAFT_08

Pair this with Confidence's Spotlight recommendations (ship / continue / end / abort) at the platform layer. [source: Methodology_Confidence_to_Pluralsight.md, §F4, §PM3]

---

## 5. One-tailed vs two-tailed

### 5.1 Default position

**Two-tailed is the default.** the A/B testing platform's built-in significance calculation is two-tailed and this is *"generally good practice because it prevents incorrectly calling 'wins' when there is no real effect."* [source: One-Tailed Testing, p.4]

### 5.2 When one-tailed is acceptable

Only when the **objective is to detect harm**, not to measure general effects.

> "Use one-tailed tests only when the objective is to detect harm, not to measure general effects." — One-Tailed Testing, p.10

Canonical example from the doc: a *prominent login* change — the feature ships regardless (it's necessary), and the only question is "does it hurt conversion?" [source: One-Tailed Testing, p.4]

### 5.3 The hidden risk

A one-tailed test **halves the rejection-region barrier in one direction**, doubling sensitivity but losing the ability to detect an effect in the opposite direction. If used for a regular "is this better?" test, you inflate Type I error and risk shipping noise.

### 5.4 The workflow (the A/B testing platform does not support one-tailed natively)

1. Precompute sample size with the **Booking.com Power Calculator** using a *one-tailed* significance level (e.g., p=0.05 instead of 0.025 for two-tailed). [p.6]
2. Launch the test in the A/B testing platform as usual; **ignore the A/B testing platform's built-in significance**.
3. Stop when sessions reach the precomputed sample size.
4. Export data; run a **one-tailed proportion test in R** (see code in pp.7-9).

> "By running a one-tailed power calculation, we estimate the optimal stopping point for our test, preventing unnecessary data collection." — One-Tailed Testing, p.6

**Quality caveat in the source.** The provided R script uses `alternative = "two.sided"` even in the one-tailed workflow — this looks like a doc bug; the Coach should warn the user to set `alternative = "less"` (or `"greater"` depending on harm direction) for a genuine one-tailed test. [conflict: §8]

### 5.5 Related cousin — non-inferiority

Confidence covers **non-inferiority margin (NIM)** as the formal cousin of one-tailed defensive testing — "we need this to not go down" framed as a margin rather than a point test. [source: Methodology_Confidence_to_Pluralsight.md, §DS3]

---

## 6. Confidence → Pluralsight migration context

The onboarding restructure (see Methodology_Confidence_to_Pluralsight.md) reshapes how the Coach should reason about methodology recommendations.

### 6.1 What changed

- **Stats backbone = Confidence.** Spotify Confidence becomes the statistical reference for sequential testing, power/alpha, effect sizes, multiple comparisons, CUPED, ratio metrics. *"Confidence's statistics content is battle-tested at Spotify's scale — thousands of experiments, millions of users. It should be the backbone for the DS track."* [Methodology_Confidence_to_Pluralsight.md, §0]
- **Process & advanced designs = LHG (Brice's) content.** Hypothesis coach, switchback, one-tailed workflow, decision protocols, documentation/LLM angle — these are LHG-unique and dominate the PM track. [§0, §8]

### 6.2 Methodology implications for the Coach

- For **standard A/B mechanics** and **stat tests deep dive** (superiority, non-inferiority, inferiority, one-tailed, multiple comparisons), defer to Confidence's framing. [§DS3]
- For **switchback / quasi-experimental** recommendations, defer to LHG content (Switchback Framework PDF, Tarification Test deck). Confidence does not cover these. [§DS5]
- For **CUPED / variance reduction** ("typically reduces variance by 20-40% for engagement metrics, 10-20% for revenue"), Confidence is authoritative. [§DS4]

### 6.3 Migration tradeoffs

- **Risk: IP concern with Confidence.** Rewrite, don't copy. *"Confidence is public documentation. Statistical concepts are universal. Cite academic papers, not Spotify."* [§13]
- **Risk: stale content.** Statistical content (DS1-DS4) is stable; process content links out to a Cheat Sheet so updates propagate. [§13]
- **Risk: completion rate.** Front-load Foundation (5 modules, 60 min) so any new joiner gets the methodology basics even if they bail before the role track. [§0, §1, §10]

---

## 7. Useful quotes (verbatim, for citation)

> "Gate-keeper model that prevents teams from jumping to expensive A/B tests without proper foundational validation." — Testing Compass PRD, p.1

> "Teams waste resources by skipping to A/B tests without: Understanding if the problem is clear enough to test solutions; Validating if they can measure meaningful metrics; Ensuring test outcomes will drive actionable decisions." — Testing Compass PRD, p.1

> "Method: A/B Test. Why: All validation criteria met; ready for statistical testing. Prerequisites: Hypothesis documented; Tracking infrastructure; Sufficient traffic (>1000 users/week); Decision threshold defined." — Testing Compass PRD, p.5

> "Method: Fake Door Test. Why: Building is expensive; validate demand first… Measure conversion rate (>15% = proceed)." — Testing Compass PRD, p.5

> "Method: Feedback AI Survey. Why: Cannot reach statistical significance; use qualitative input." — Testing Compass PRD, p.6

> "Method: Do Not Run A/B Test. Why: Missing critical prerequisites (hypothesis/measurement/actionability)." — Testing Compass PRD, p.6

> "the A/B testing platform (our AB Testing tool) operates on the .com frontend and cannot reach the backend pricing engine. Standard A/B testing is therefore not viable for pricing policies." — Switchback Framework, p.3

> "Cluster independence is the foundational assumption of this design. If customers shift from a high-price route to a low-price route during the experiment, the control group is contaminated and the result is biased." — Switchback Framework, p.5

> "Weekly [cadence]: Recommended. Strong precision gain. Simpler to operate. Aligns with natural booking cycles. Start here." — Switchback Framework, p.6

> "Washout window: at each switch, exclude 1-2 days of data from the analysis. Do not apply the new price and immediately start measuring." — Switchback Framework, p.7

> "Y(i,t) = route fixed effect + time fixed effect + beta x Treatment(i,t) + error" — Switchback Framework, p.9

> "the A/B testing platform's computation engine is two-tailed by default, which is generally good practice because it prevents incorrectly calling 'wins' when there is no real effect. However, this approach doubles the time required to reach significance." — One-Tailed Testing, p.4

> "Use one-tailed tests only when the objective is to detect harm, not to measure general effects." — One-Tailed Testing, p.10

> "If our only goal is to detect negative impact, a one-tailed test is the optimal choice to reduce test duration while maintaining reliability." — One-Tailed Testing, p.4

> "Tip: Tests with higher baseline metrics (e.g., 10%) reach significance faster than tests with lower ones (e.g., 1%)." — Feasibility Guide, p.4

> "Industry Standard [Lift Expectation] = 5%." — Feasibility Guide, p.4

> "A decision protocol is a pre-commitment device. It eliminates post-hoc decision making by requiring teams to agree on what they will do for every possible outcome before they see any results." — DRAFT_08

> "Before go-live. The protocol is locked. No modifications once data collection starts. This is the equivalent of pre-registration in academic research." — DRAFT_08

> "The best time to decide what you will do with experiment results is before you have them." — DRAFT_08

> "If we cannot randomize at session level We can randomize at route level." — Tarification Test, p.5

> "BEFORE AAM: Weekly switching per route: not feasible. AFTER AAM: Weekly switching per OND and flight date: Now feasible." — Tarification Test, p.10

---

## 8. Conflicts / gaps

### 8.1 Conflicts in the sources

- **One-Tailed Testing R script vs. its own narrative.** The R code on p.7 of *One-Tailed Testing Negative Impacts.pdf* sets `alternative = "two.sided"` and the result-printing branch reads *"Strong evidence that the treatment performs better than the control"* — both inconsistent with the doc's own claim of running a one-tailed harm-detection test. Coach must override: when the user is doing the documented workflow, set `alternative = "less"` or `"greater"` (depending on harm direction) and flip the success-message wording.
- **PRD "AB_TEST" prerequisite says ">1000 users/week"; Feasibility Guide says runtime is set by the Power Calculator output.** The 1,000 users/week threshold in the PRD [p.5] is a *floor heuristic*, not a real feasibility criterion. The Coach should always run the Power Calculator instead of citing the threshold as a rule.

### 8.2 Concepts hinted at but not detailed in these sources

- **A/B/n** (multi-variant) — not formally named in any of the 7 source files. Coach should treat as A/B with N-arm sample-size recheck. [gap]
- **MVT (multivariate / factorial)** — not covered. [gap]
- **Holdout design** — only referenced obliquely via Confidence's "exclusive experiments." No LHG-specific holdout policy in scope. [gap]
- **Sequential testing operational guidance.** Confidence covers the theory but the LHG-specific source files do not document when LHG analysts should use it on the A/B testing platform (which has no native always-valid CIs). [gap]
- **Quasi-experimental methods** (DiD, synthetic control, RDD) — mentioned in the Confidence-migration doc as DS5 content but no LHG-authored playbook is in this slice. [gap]
- **Bayesian methods** — not mentioned anywhere in the seven sources. [gap]
- **Confidence threshold convention.** The DRAFT_08 example table uses **90%** confidence; standard LHG practice elsewhere uses **95%** (and the A/B testing platform defaults two-tailed). Coach should default to 95% but allow the user to override at planning time. [conflict / clarification]
- **Fake-door 15% conversion threshold.** PRD prescribes ">15% = proceed" without justification. This is a heuristic, not a defensible decision rule for every product. Treat as a starting point, not a law. [gap]

### 8.3 Coach behavioural rule

When the user lands on `AB_TEST` from COMPASS, **always** run the feasibility check (§3) and the methodology overlay (§1.4) before issuing the final recommendation. The PRD's Q7 is a self-assessment ("can I reach significance?") — the Coach should *verify* it with the Power Calculator inputs, not take the user's word for it.

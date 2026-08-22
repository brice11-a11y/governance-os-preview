---
title: Metrics & Measurement Knowledge
sources:
  - the A/B testing platform Onboarding Session 2 Process.pdf — UIA platform team process; where the A/B testing platform fits in the workflow (touchpoints, metric definition step)
  - Measuring Revenue Impact of A_B Tests-v7-20260415_111313.pdf — the A/B testing platform vs GA4 alignment, Revenue-Per-Session uplift formula, mapping uplift to real revenue via Corona, currency & dampening
  - Risques de Suivi des Métriques.pdf — multiple-comparisons / cumulative alpha risk, why you commit to one primary metric (content is in English despite French title)
  - Example of test result.pdf — Excess Baggage Bundle test test, the canonical AirGroup result-presentation template
  - A_B Test Feasibility Guide_ Calculate Time to Significance-v3-20260415_111006.pdf — baseline rate, MDE, traffic, expected lift, Booking.com Power Calculator
  - Hypothesis Coach V0.pdf (A/B Testing Hypothesis Evaluation Playbook) — hypothesis template with goal metric + invariant metric
  - Q&A Expérimentation.pdf — the A/B testing platform scope (web/WebView/Firebase, no email/marketing), Disjoint Groups, API events, GA4 vs the A/B testing platform, A/A tests, STEDII framework
  - One-Tailed Testing Negative Impacts.pdf — when one-tailed makes sense, why the A/B testing platform's built-in significance is two-tailed
  - Tarification Test.pdf — switchback (route-level randomization) when session-level testing cannot reach the pricing stack
  - Experiment Quality Scoring Framework.md — scoring sub-scores for Measurement Quality (single primary, guardrails, sample size, SRM, normalization)
  - What Makes a Good AB Test.md — consolidated metric standards used by the chapter
last_extracted: 2026-05-27
extracted_by: subagent (Coach knowledge swarm)
---

# Metrics & Measurement

## 1. What the A/B testing platform can measure (concrete catalog)

the A/B testing platform is the AirGroup experimentation platform. It is "implemented by default" anywhere Tealium tracking exists (Q&A p.6). Coach should treat the A/B testing platform as the source of truth for session-level metrics and treat anything outside this stack as out-of-tool.

### 1.1 Where the A/B testing platform is implemented

- **Desktop internal pages** — "almost all" testable as long as Tealium is implemented (Q&A p.6).
- **WebView pages** — testable via the A/B testing platform (Q&A p.6).
- **Native pages** — Firebase-based; the A/B testing platform implementation is ongoing as of June 2025 (Q&A p.6).
- **NOT testable in the A/B testing platform:** emails, marketing pages (Q&A p.6).
- **NOT testable in the A/B testing platform:** backend pricing / route-level pricing — "Standard AB Test tools cannot reach Backend Pricing stack." Use switchback methodology with AAM tooling instead (Tarification Test p.5).
- **NOT recommended on payment flows** — JS injection is risky; PAY value stream uses a COP-designed native framework with user-ID level randomization instead (What Makes a Good AB Test, ctx rules).

### 1.2 Metrics & event classes natively available in the A/B testing platform

| Metric / object | Definition | the A/B testing platform backing |
|---|---|---|
| `Revenue Per Session (RPS)` | Total purchase revenue ÷ sessions, **captured at the point of purchase only, not at the shopping cart stage** | Native the A/B testing platform metric. "This makes it a reliable measure of actual completed transactions, not intent." (Revenue Impact p.4) |
| `Average Order Value (AOV)` | Per-session revenue metric, session-level | Native the A/B testing platform (Revenue Impact p.3) |
| `Revenue (absolute, EUR)` | All revenue values converted to Euro by default at implementation | Captured via Tealium → RefX datalayer fallback → confirmation URL fallback (Revenue Impact p.4, p.8) |
| `Sessions` | the A/B testing platform's own session count — differs from GA4 by ~8.2% on average | Native; the canonical denominator for any rate metric (Revenue Impact p.3) |
| `Unique visitors` | Distinct visitors via `utag.data.tealium_visitor_id` (the the A/B testing platform ID Collector) | Native; cross-device identifier (Q&A p.11) |
| `Conversion rate / Goal completion rate` | Goal completions ÷ sessions or visitors | Native binomial metric; supported in Power Calculator workflow as "Binomial Metric → preferred" (Feasibility p.4) |
| `Bounce rate` | Single-page-view sessions ÷ sessions | Reported in canonical result template (Example of test result p.4) |
| `API metric` (custom event) | Any event fired by custom JavaScript, e.g. "Add Bag to Cart," "Confirmed Bag Purchased," "Interaction Rate" | **NOT automatically triggered.** Must be fired manually in EVERY variant including Control. If you only fire it in Variant A, the Control variant shows 0 events and the test is broken (Q&A p.9, "API events in the Control variant are showing 0"). |
| `Bag take rate`, `Confirmed Bag Purchased`, `Bag Add to Cart` | Ancillary-specific custom events for the Excess Baggage Bundle / ANC value stream | Custom API metrics, fired per variant (Example of test result, multiple pages) |
| `Interaction Rate` | Custom event for engagement on cards/banners (e.g. PPFI Web Banner) | Custom API metric (the A/B testing platform Onboarding p.8) |

### 1.3 Audience-targeting dimensions ("Who" section)

These are not metrics, but they are the dimensions Coach should reference when challenging audience definitions (Q&A p.9–10):

- Booking and Searching information (e.g. flight routes flown in last 30 days, cabin class)
- Weather at user's location
- Device and OS
- Language (`en`, `de`, …) and Market — selected via Landing → Custom Variables
- Cookies, country, metadata, visitor attributes, badges (visitor types), specific audiences
- Disjoint Groups (1–10, each = 10% of traffic) — use these to limit a test to e.g. 40% of traffic while keeping a clean 50/50 split inside that slice (Q&A p.9)

### 1.4 Outlier / dampening controls

the A/B testing platform offers a "dampening" feature on **Custom Reports only** (NOT real-time dashboards) that scales purchase values above a chosen threshold (Revenue Impact p.8):

| Setting | Effect |
|---|---|
| No Dampening (default) | All purchase values as-is |
| 1 SD | Aggressive — scales values > 1 SD above mean |
| 2 SD | Moderate — scales values > 2 SD |
| 3 SD | Conservative — only extreme outliers scaled |

Dampening cannot be changed on an existing report; you must duplicate the report and adjust on the copy.

### 1.5 What CANNOT be measured directly in the A/B testing platform (gaps)

- **Anything on email or marketing pages** — the A/B testing platform not deployed there (Q&A p.6).
- **Native mobile app metrics outside WebView** — Firebase route, still ramping (Q&A p.6).
- **Backend pricing experiments at route level** — needs switchback + regression model, not the A/B testing platform's session-level randomization (Tarification Test p.5, p.9).
- **One-tailed significance** — the A/B testing platform's computation engine is two-tailed by default. To detect harm only, you precompute sample size with the Booking.com Power Calculator, stop the test manually at that count, and run a one-tailed `prop.test()` in R (One-Tailed Testing p.4–7).
- **Absolute total revenue figures** — the A/B testing platform's absolute revenue is misleading because of traffic allocation, ad blockers (~40% of sessions not tracked), and audience targeting. Always pull baseline revenue from Corona (Revenue Impact p.6).
- **Reliable absolute session counts vs other systems** — GA4 and the A/B testing platform "will never report identical session counts." GA4 averages 8.2% fewer sessions (Revenue Impact p.3).
- **Anything requiring random assignment of pricing across routes simultaneously** — pricing is set at route level, "every user sees the same price" on a given route at a given time (Tarification Test p.5).

## 2. Primary metric vs guardrail metric

### 2.1 Strict definitions

- **Goal metric (a.k.a. primary metric):** the single metric the experiment is designed to move. Defined in the hypothesis: "we will increase [goal metric] … by [specific percentage]" (Hypothesis Coach V0 p.4). In the A/B testing platform this is set in the "Goal" field — see canonical "Goal Metric SHOPPING CART → BAG ADDED" in Excess Baggage Bundle (Example of test result p.1).
- **Invariant / guardrail metric:** the metric that **must not be impacted negatively** by the change. From the hypothesis template: "…without impacting [invariant metric, e.g. 'page load time']" (Hypothesis Coach V0 p.4). Thresholds vary by risk appetite: BCR drop > 5% for bold tests, > 2% safe, > 1% extra safe (What Makes a Good AB Test, metric standards).
- **Secondary metric:** monitored but **not the basis for decision-making**. If primary fails and a secondary lights up, that's noise, not a result (Risques §3).

### 2.2 The one-primary-metric rule

This is the single most violated principle and the Coach must guard it aggressively:

> "Each additional metric increases the chance of detecting a randomly significant result, even if nothing actually changed." — Risques de Suivi des Métriques p.5

The cumulative-alpha math from Risques §3.1:
- 1 metric @ p=0.05 → 5% chance of false positive
- 10 metrics → ~40% chance of at least one false positive
- 20 metrics → ~64% chance of at least one false positive

> "If the original goal metric does not reach significance, acting on another metric invalidates the test and increases the risk of making the wrong decision." — Risques p.6

Scoring framework penalty: "Multiple primary metrics → Score 0 on single primary metric" sub-score (Scoring Framework, anti-pattern table).

### 2.3 AirGroup-context examples

**Strong primary metrics:**
- "Bag Add to Cart rate" on the Shopping Cart page (Excess Baggage Bundle test, Example of test result p.1)
- "Click-through rate (CTR) on homepage CTA button" (Hypothesis Coach V0 p.9)
- "Interaction Rate on PPFI Web Banner" for logged-in mobile users with an upcoming flight (the A/B testing platform Onboarding p.8)
- "Revenue Per Session" for any commercial test where revenue is the explicit goal (Revenue Impact, throughout)
- "Booking Conversion Rate (BCR)" for funnel-level tests

**Strong guardrail metrics:**
- Page load time (Hypothesis Coach V0 template example)
- Booking Conversion Rate when the test is on an ancillary, not on conversion itself
- Bounce rate (Example of test result p.4 reports it as an "Invariant and Relevant Secondary Metric")
- Bag Take Rate when goal is Bag Add-to-Cart (Example of test result p.1 — "without negatively affecting the Bag Take Rate")
- Customer support inquiries (decision protocol example: "If customer support inquiries increase by more than 15%, even a positive primary result triggers a modified implementation" — What Makes a Good AB Test)

## 3. Metric formulation patterns

### 3.1 The canonical "rate" pattern

AirGroup formulates conversion-style metrics as binomial rates because they reach significance faster than continuous metrics (Feasibility p.4): "Binomial Metric (e.g., conversion rate) → preferred."

**Pattern:**
> `% of {denominator} that {took action} out of {denominator} that {entered scope}`

Concrete examples from Excess Baggage Bundle (Example of test result p.4):
- "Add Bag to Cart" on Desktop Control = 5.76% — i.e. sessions that added a bag ÷ sessions on the bag page
- "Bounce Rate" on Desktop Variant A = 1.87%

### 3.2 Other AirGroup-canonical patterns

- **Per-session metrics** (preferred over absolute counts): RPS, AOV, "clicks per user," "Confirmed Bag Purchased per session." Rationale: "Normalize metrics by sample size … 'clicks per user' not 'total clicks.'" Scoring framework awards 2 points for normalization, 0 for raw totals (Scoring Framework §3B).
- **Lift expressed as relative %**: `Revenue Uplift (%) = [RPS(Test) − RPS(Control)] × 100 / RPS(Control)` (Revenue Impact p.4).
- **Pre-registered numeric target in the hypothesis**: "by at least 3%" — Coach should reject anything without a number (Hypothesis Coach V0 p.4).

### 3.3 STEDII / "good metric" properties

The chapter uses Microsoft / Ron Kohavi's STEDII as the canonical metric-quality check (Q&A p.8). A metric should score on:

- **S**ensitivity — detects real changes within the test's traffic budget
- **T**rustworthiness — not gamed, not distorted, captured reliably
- **E**fficiency — short time to significance
- **D**ebuggability — when it moves, you can tell why
- **I**nterpretability & Actionability — a non-statistician can act on it
- **I**nclusivity & Fairness — works across segments, not skewed by one cohort

(Plus the four properties in What Makes a Good AB Test: sensitivity, directionality, coverage, robustness.)

### 3.4 Anti-patterns the Coach must challenge

| Anti-pattern | What to say |
|---|---|
| "Improve conversion rate" with no page / denominator / event | Push back: "On which page, with what denominator, counting what event?" |
| Absolute counts ("we will increase total clicks") | Normalize by sample size — "clicks per user," not "total clicks." Volume bias makes results incomparable across segments. |
| Vague engagement metric ("engagement," "interaction") | Scoring framework gives 2/3 on Measurement when "definition is loose (e.g., 'engagement' without specifying what counts)." Force a concrete event. |
| 2+ metrics sharing equal priority | Scoring framework: "2 = primary metric exists but 2+ metrics share equal priority." Force a single primary. |
| Goal metric set in the A/B testing platform but custom API event only fired in Variant A | Test will report Control = 0. "Unlike the other the A/B testing platform metrics, an API metric, it is NOT automatically triggered. So, you will need to trigger the API metric on every variant." (Q&A p.9) |
| Primary metric is GA4-only | GA4 cannot be used for significance / decisions: "no result gathered within GA4 or outside the A/B testing platform can be used to take decisions, because there would be no significance." (Q&A p.12) |
| Reporting absolute the A/B testing platform revenue as the business impact | Misleading — the A/B testing platform sees ~60% of sessions (40% ad-blocked), only a subset of markets/devices, and only the test cell, not 100% traffic. Use Corona × uplift %. |

## 4. Revenue impact computation

Source: Measuring Revenue Impact of A/B Tests v7 (entire document).

### 4.1 Why the A/B testing platform (not GA4) for revenue-level metrics

> "GA4 and the A/B testing platform will never report identical session counts, due to fundamental differences in tracking logic, session handling, and attribution timing. … the A/B testing platform should be used as the primary source for session-level metrics (Revenue Per Session, Average Order Value), while actual total revenue numbers should be sourced from a reliable financial system (e.g. Corona data)." — Revenue Impact p.3

Why the A/B testing platform is structurally more reliable for revenue capture:

- the A/B testing platform uses **Tealium + a direct RefX backup**.
- If the RefX datalayer doesn't load immediately, the A/B testing platform **waits**.
- If still unavailable, it **falls back to the confirmation URL** to extract value.
- Multi-step fallback ensures capture in edge cases.
- GA4 has **no fallback**: any datalayer issue → revenue lost (Revenue Impact p.4).

### 4.2 The uplift formula

> Revenue Uplift (%) = [RPS (Test) − RPS (Control)] × 100 / RPS (Control)
> — Revenue Impact p.4

Key detail to cite: "Revenue Per Session in the A/B testing platform is captured at the point of purchase only, not at the shopping cart stage. This makes it a reliable measure of actual completed transactions, not intent."

### 4.3 Mapping uplift to real revenue (3-step methodology)

the A/B testing platform's absolute revenue is misleading because of three factors (Revenue Impact p.6):

| Factor | Why it matters |
|---|---|
| Traffic allocation | Tests typically target a subset (e.g. 50/50 split), not 100% |
| Ad blockers | ~40% of sessions are not tracked by the A/B testing platform due to ad blockers |
| Audience targeting | Tests may only target specific markets, devices, or segments |

**Recommended approach:**

1. **Compute uplift %** — `[RPS(Test) − RPS(Control)] / RPS(Control)` from the A/B testing platform.
2. **Get baseline revenue** for the relevant scope (product, market, timeframe) from a reliable financial source — **Corona**.
3. **Apply uplift:** `Incremental Revenue = Baseline Revenue (Corona) × Revenue Uplift % / 100`.

(Revenue Impact p.6.)

### 4.4 Currency & outliers

- All the A/B testing platform revenue is converted to **Euro by default** at implementation. Currency differences "do not introduce noise into the metrics under normal conditions." (Revenue Impact p.8)
- **Outlier risk:** an unmapped currency or an Amadeus tracking change could cause a local-currency value to be interpreted as EUR (e.g., 1,000,000 in a low-denomination currency recorded as EUR creates a huge outlier). "Very unlikely" but real.
- **Mitigation:** Custom Report with dampening at 2 SD (moderate) or 3 SD (conservative) — see §1.4.

### 4.5 Best-practice extras (from What Makes a Good AB Test)

- Use the **lower bound of the confidence interval**, not the point estimate.
- **Account for the GA4 / the A/B testing platform session discrepancy** (~8.2% on average, "5–10%" in the chapter doc).
- **Present a range**, not a single number.

## 5. Metric-tracking risks

Source: Risques de Suivi des Métriques (English content despite French filename) + Scoring Framework §5 (Execution Integrity).

### 5.1 Multiple comparisons / cumulative alpha

- Each extra metric is an additional independent test.
- 10 metrics → ~40% chance of at least one false positive; 20 → ~64% (Risques §3.1).
- **Coach rule:** if a hypothesis lists more than one primary metric, push back hard. Score 0 on the single-primary sub-score otherwise.

### 5.2 Selection bias / p-hacking ("metric pivoting")

> "Bad Practice: 'Metric A didn't move, but Metric B reached significance—let's focus on that instead!'
> Good Practice: Stick to the predefined primary metric, even if other metrics appear significant post-test."
> — Risques p.6

This is HARKing (Hypothesizing After Results Are Known) — cherry-picking metrics, redefining success post-hoc.

### 5.3 Peeking & early stopping

- Stopping when p-value first crosses 0.05 inflates actual false-positive rate far above 5% (What Makes a Good AB Test, red flags).
- Scoring framework: "No early stopping" sub-score — "0 = stopped early based on peeking at intermediate results" (Scoring Framework §5).
- Only valid early-stop reason: a guardrail breach.

### 5.4 Mid-flight metric changes

- "Primary metric unchanged from pre-registration." 7 points if held, **automatic zero** if changed (Scoring Framework §5).
- Decision protocol must be locked before go-live; "Equivalent of pre-registration in academic research."

### 5.5 Sample Ratio Mismatch (SRM)

If treatment and control sizes diverge from the configured split, the test is contaminated. Common AirGroup causes from Q&A §7.1.1:

- **Action conditions differ between variants** (e.g., Control has "pagetype = TRAVELER" while Variant A has the action condition blank → fires on every page). This single misconfiguration is the documented #1 cause of "Why is it not 50/50?"
- Bot filtering, consent banner interaction, redirect chain, SDK initialization timing, server-side caching (What Makes a Good AB Test).

Run **A/A tests** regularly to confirm no bias: "We regularly conduct A/A tests. … This helps confirm that the A/B testing platform is implemented correctly and that the results are reliable, free from any inherent bias." (Q&A p.13)

### 5.6 Ad blocker / cookie bias

> "the A/B testing platform is activated only when a user does not have an ad blocker and has accepted the relevant cookies. Once the A/B testing platform is triggered, randomization occurs … This process ensures that all variants are viewed by the same type of users, effectively eliminating any bias from the results." — Q&A p.13

In other words: ad blockers reduce **coverage** (you see ~60% of real traffic), but they do not bias the **comparison** between Control and Treatment because randomization happens after the A/B testing platform fires.

### 5.7 Mid-test bug fixes

If a bug is fixed mid-test and the test continues, carryover effects contaminate the data. If the fix is substantial, **restart cleanly** (What Makes a Good AB Test, red flags).

### 5.8 Insufficient power / low baseline

From Feasibility p.7: "Tests with a higher baseline conversion rate (e.g., 10%) are more likely to achieve significance within a reasonable timeframe compared to tests with low rates (e.g., 1%). … Smaller lifts (e.g., ±1%) require significantly larger sample sizes and longer test durations." Use the Booking.com Power Calculator before launch; industry standard expected lift = 5%.

## 6. Test result presentation — the Excess Baggage Bundle template

Source: Example of test result.pdf — "Excess Baggage Bundle – Excess Baggage Expandable" by Linh Dang, ANC value stream. This is the canonical AirGroup result page template.

### 6.1 Standard header / context block

```
Experimentation Start Date | Experimentation End Date
Goal Metric                | Impact On Goal Metric
Next Step                  | Tenant (brand codes)
Market (All / specific)    | Device (Mobile / Desktop / Both)
Number of Variants (incl. Control)
Language Tested            | Pages Modified
Value Stream               | Art / Team / Author
Developer / PO / BA / Designer
ticket system Ticket link
```

### 6.2 Body sections

1. **Executive Summary** — what the test evaluated, the variants, the hypothesis, and the explicit guardrail ("without negatively affecting the Bag Take Rate").
2. **What We Observed** — split by Desktop and Mobile, calling out which metric reached significance and which did not.
3. **Per-device breakdown table** (GA4 revenue, by item variant — FBAG, SBAG, MBAG, IBAG, JBAG, KBAG — with Item revenue and Item quantity columns per variant).
4. **Next Steps** — concrete recommendation per device (e.g., "For Desktop, apply Variant B with expanded tabs; for Mobile, apply the original design of Variant B").
5. **Designs** — screenshots of variants.
6. **Key Results: Goal Metric table** — variant × device, with explicit "(no significant)" tag on every cell that did not reach significance.
7. **Key Results: Invariant and Relevant Secondary Metrics tables** — same shape as goal metric, for each guardrail (Confirmed Bag Purchased, Bounce Rate, etc.).
8. **Learnings** — narrative section comparing user behavior across platforms.
9. **Additional Links and Resources** — the A/B testing platform experiment links for Desktop and Mobile.
10. **Tags** — `experimentation`, `skai-include`, `skai-experimentation-platform_monetate`.

### 6.3 Coach implication

If a user asks "what does a finished result look like?", Carter can surface the Excess Baggage Bundle structure: header context block → executive summary → per-device tables with `(no significant)` annotations → next steps → learnings. The explicit "(no significant)" labelling on every non-significant cell is a chapter convention — Coach should preserve it when generating result previews.

## 7. Useful quotes (verbatim, for citation)

> "Revenue Per Session in the A/B testing platform is captured at the point of purchase only, not at the shopping cart stage. This makes it a reliable measure of actual completed transactions, not intent."
> — Measuring Revenue Impact of A/B Tests, p.4

> "GA4 and the A/B testing platform will never report identical session counts, due to fundamental differences in tracking logic, session handling, and attribution timing."
> — Measuring Revenue Impact, p.3

> "On average, GA4 reports 8.2% fewer sessions compared to the A/B testing platform. This is the closest alignment achievable with the current AirGroup setup."
> — Measuring Revenue Impact, p.3

> "the A/B testing platform's multi-layer fallback (Tealium → RefX datalayer → confirmation URL) makes it structurally more reliable for revenue capture than GA4, which depends on a single data source with no wait or retry mechanism."
> — Measuring Revenue Impact, p.4

> "Revenue Uplift (%) = [RPS (Test) − RPS (Control)] × 100 / RPS (Control)"
> — Measuring Revenue Impact, p.4

> "Incremental Revenue = Baseline Revenue (Corona) × Revenue Uplift % / 100"
> — Measuring Revenue Impact, p.6

> "~40% of sessions are not tracked by the A/B testing platform due to ad blocker usage."
> — Measuring Revenue Impact, p.6

> "Testing 1 metric at p = 0.05 → 5% chance of a false positive. Testing 10 metrics → ~40% chance. Testing 20 metrics → ~64% chance."
> — Risques de Suivi des Métriques, p.5

> "If the original goal metric does not reach significance, acting on another metric invalidates the test and increases the risk of making the wrong decision."
> — Risques de Suivi des Métriques, p.6

> "Predefine and commit to a primary metric before starting the test. … Never pivot decisions based on unexpected significant results that weren't part of the original hypothesis."
> — Risques de Suivi des Métriques, p.7

> "Unlike the other the A/B testing platform metrics, an API metric, it is NOT automatically triggered. So, you will need to trigger the API metric on every variant."
> — Q&A Expérimentation, p.9

> "No result gathered within GA4 or outside the A/B testing platform can be used to take decisions, because there would be no significance. These results can only be used to get a sense of user's behavior."
> — Q&A Expérimentation, p.12

> "the A/B testing platform is activated only when a user does not have an ad blocker and has accepted the relevant cookies. Once the A/B testing platform is triggered, randomization occurs, determining which group a user will be assigned to and which variant they will see."
> — Q&A Expérimentation, p.13

> "the A/B testing platform's computation engine is two-tailed by default, which is generally good practice because it prevents incorrectly calling 'wins' when there is no real effect. However, this approach doubles the time required to reach significance."
> — One-Tailed Testing Negative Impacts, p.4

> "Tests with a higher baseline conversion rate (e.g., 10%) are more likely to achieve significance within a reasonable timeframe compared to tests with low rates (e.g., 1%)."
> — A/B Test Feasibility Guide, p.7

> "We believe that by changing [specific element], we will increase [goal metric] for [specific scope] by [specific percentage] without impacting [invariant metric]."
> — A/B Testing Hypothesis Evaluation Playbook (Hypothesis Coach V0), p.4

> "Standard AB Test tools cannot reach Backend Pricing stack. … If we cannot randomize at session level, we can randomize at route level."
> — Tarification Test (Ancillary Pricing A/B Testing Methodology), p.5

> "A 2% uplift that isn't significant is not a 2% uplift. It's noise."
> — DRAFT_01 (Golden Rules), via What Makes a Good AB Test

## 8. Conflicts / gaps

### 8.1 Session count: the A/B testing platform vs GA4

Two sources differ on the magnitude:
- **Revenue Impact PDF (p.3):** GA4 reports **8.2% fewer** sessions than the A/B testing platform on average.
- **What Makes a Good AB Test (chapter doc):** "Account for session discrepancies (**5–10%**)."

Use 8.2% as the canonical figure, treat "5–10%" as the chapter's rounded guidance range.

### 8.2 What's measurable today but might come up frequently

- **Cross-device user journeys** — the A/B testing platform uses `tealium_visitor_id` as its identifier (Q&A p.11). Users who switch devices may be assigned to different groups; the docs do not document this risk explicitly.
- **Long-term / delayed effects** — the A/B testing platform's RPS is captured at point of purchase only. Tests with delayed effects (e.g., loyalty, repeat booking 6 months later) are not directly measurable.
- **Real-time custom-report dampening** — dampening is "only available in Custom Reports, not in the real-time Experience Results dashboard" (Revenue Impact p.8). If a stakeholder asks for outlier-controlled real-time numbers, the answer is "duplicate the report."

### 8.3 Pricing experiments — explicit gap

Backend pricing tests are NOT in the the A/B testing platform stack. The chapter has a documented switchback methodology (Tarification Test) but as of the deck:
- Pricing operations side: AAM access and weekly price switches per route are TBD
- Data science side: K-means clustering, panel dataset, regression execution, validation, and Streamlit automation are WIP, "Needs data science expertise"

Coach must flag any pricing experiment idea as "not measurable in the A/B testing platform; requires switchback + DS support."

### 8.4 One-tailed tests — tool limitation

the A/B testing platform cannot natively run one-tailed tests. The workaround (Booking.com Power Calculator → manual stop in the A/B testing platform → custom R `prop.test()`) is documented but operational, not in-tool. Coach should warn that one-tailed conclusions require this offline workflow, never the A/B testing platform's built-in significance.

### 8.5 "Time to significance" tool

The A/B Test Feasibility Guide uses Booking.com's Power Calculator. Explicit disclaimer (Feasibility p.3): "This tool was developed by Booking.com and may differ from computations provided by the A/B testing platform. However, it remains a relevant tool for feasibility checks and planning experiments."

Coach should treat the Booking.com calculator output as the canonical sample-size input, and not be surprised if the A/B testing platform's in-platform estimate differs.

---
title: Coach Knowledge Base — Index
last_synthesized: 2026-05-27
swarm: 5 parallel agents extracted from projects/exp-os/content/knowledge/AirGroup/ (41 source files)
total_lines: 1982 across 5 knowledge files
---

# Coach Knowledge Base — INDEX

This index maps **Carter steps + criteria + Coach behaviors** to **knowledge sections**. The five knowledge files were extracted by a 5-agent swarm from the AirGroup corpus on 2026-05-27. When the Coach LLM needs to challenge a user, recommend a methodology, cite policy, or surface a quote, it retrieves from here.

---

## Files in this base

| File | Lines | Owns |
|---|---|---|
| `hypothesis-quality.md` | 210 | Thomke 6-dim framework, anti-patterns, source grounding, canonical templates, falsifiability |
| `methodology-compass.md` | 420 | COMPASS PRD 7-gate decision tree, methodology catalog (A/B/MVT/switchback/sequential/holdout/fake-door), time-to-significance, decision protocols, one-tailed vs two-tailed |
| `metrics-measurement.md` | 394 | the A/B testing platform measurable catalog, primary vs guardrail, revenue impact, tracking risks (peeking/novelty/contamination), result presentation, GA4 caveats |
| `governance-champions.md` | 531 | 10 hard gates, Champion framework + roles, Center of Excellence, RASCI matrix, maturity model, hope→enforced shift, the A/B testing platform Rollout Policy |
| `process-context.md` | 427 | End-to-end process, multi-team collision model, LH tenant structure, two-lane ownership, Booking.com benchmark, Q&A patterns, Hackathon context |
| **`hypothesis-feedback.md`** | 100 | **Brice's personally-ranked 8 LH hypotheses** across 4 dimensions (Product Change / Goal Metric / Invariant Metrics / Source) with verbatim rationale. THE calibration ground-truth — load examples from here when tuning any per-dimension prompt. See memory entry [[project-coach-calibration]]. |

---

## Mapping: Carter step → knowledge file → section

| Carter step | Coach behavior | Knowledge file | Section to load |
|---|---|---|---|
| `idea` | Validate input IS a product change; nudge if vague | `hypothesis-quality.md` | §1 (must-haves), §2 (anti-patterns) |
| `idea` | Cite canonical examples of good ideas | `hypothesis-quality.md` | §3 (strong examples) |
| `evidence` | Grade source-grounding (LLM-wired today) | `hypothesis-quality.md` | §3 (strong/weak), §4 (falsifiability), §6 (quotes for citation) |
| `evidence` | Soft-redirect for weak input | `process-context.md` | §8 (Booking.com 80%-no-power-calc benchmark as social proof) |
| `variant` | Challenge vague variants | `hypothesis-quality.md` | §2 (anti-patterns) |
| `variant` | Cite canonical "what users see differently" form | `hypothesis-quality.md` | §5 (canonical template) |
| `audience` | Pin down tenant/market (LH/LX/OS/SN/ITA) | `process-context.md` | §5 (LH tenant structure) |
| `audience` | Two-lane ownership: Sales-Commercial-Push vs Hangar-Experimentation | `process-context.md` | §6 (Stakeholder Map two-lane model) |
| `primary-metric` | Force ONE primary, reject multi-primary | `metrics-measurement.md` | §2 (primary vs guardrail), §5 (multi-comparison risk) |
| `primary-metric` | Challenge vague metric definitions ("conversion rate" → which page, which event) | `metrics-measurement.md` | §3 (formulation patterns, "% of {denominator} that {action} on {scope}") |
| `primary-metric` | Flag out-of-the A/B testing platform metrics | `metrics-measurement.md` | §1 (the A/B testing platform measurable catalog), §8 (gaps) |
| `expected-lift` | Validate falsifiable prediction with MDE | `methodology-compass.md` | §3 (time-to-significance & power) |
| `guardrail` | Confirm threshold + breach policy | `metrics-measurement.md` | §2 (primary vs guardrail), §5 (tracking risks) |
| `guardrail` | Cite the 5%/2%/1% LH defaults | `governance-champions.md` | §1 (hard gate 4 — guardrails defined) |
| `methodology` | **Recommend methodology** via COMPASS | `methodology-compass.md` | §1 (COMPASS full backbone) → §2 (catalog when AB_TEST is too generic) |
| `methodology` | Switchback for pricing | `methodology-compass.md` | §2.switchback, §6 (Tarification Test) |
| `methodology` | One-tailed for harm-only defensive launches | `methodology-compass.md` | §5 (one-tailed vs two-tailed) — **with override of doc bug** |
| `methodology` | Sequential when peeking is needed | `methodology-compass.md` | §2.sequential |
| (any) | "What do you think?" answer-back | `process-context.md` | §7 (Common Q&A patterns) |
| (any) | Pre-launch sign-off, conflict check | `governance-champions.md` | §1 (hard gates 6 & 7) |
| (any) | Decision protocol enforcement | `methodology-compass.md` | §4 (decision protocols from DRAFT_08) |
| Pre-launch gate | Pre-registration timestamp, HARKing prevention | `governance-champions.md` | §1 (hard gate 8) |
| Post-test | Documented conclusion before next test | `governance-champions.md` | §1 (hard gate 9) |
| Rollout decision | the A/B testing platform winner deployment / exception | `governance-champions.md` | §8 (the A/B testing platform Rollout Policy, in-force) |

---

## Cross-cutting findings (conflicts & gaps the swarm surfaced)

These are the highest-leverage things the Coach prompt-writers need to resolve:

### 1. Source-as-evidence vs competitor analysis (RESOLVED 2026-05-27 — v2 shipped)
- The conflict between v1's "competitors do X → opinion" hard rule and Thomke's framework (which lists competitors as a valid source) was resolved by separating the SOURCE LABEL from the OBSERVATION test.
- **Resolution (now active in v2):** Strip away the source label. Ask: *was something observed, and is it quantified?* A bare "competitor X has Y" is still 0 (no observation, no number). A measured competitor benchmark — "we measured Competitor X's funnel via session-scrape n=240 in April 2026 and observed 26% drop-off vs our 38%" — counts as quantified Behavioural data. Same logic for "best practices" → opinion vs. a cited external case study with numbers + method → quantified Prior experimentation.
- **Where the resolution lives:**
  - Prompt v2: `coach/src/prompts/hypothesis-dimension-1-source/v2.md`
  - Route updated to PROMPT_VERSION = `'v2'`
  - Fallback (`coach/src/fallback/hypothesis-dimension-1-source.ts`) extended with `observed` / `measured` / `benchmarked` / `methodology_marker` patterns so the deterministic side recognizes the same evidence shape
  - Eval cases at `coach/eval/cases/hypothesis-source.jsonl` expanded with `src-6` (quantified competitor benchmark → 4-5) and `src-7` (vague competitor mention → 0-1). Full eval: **7/7 passing, 0 low-confidence**.

### 2. COMPASS terminates at AB_TEST without picking the kind (GAP)
- The COMPASS PRD's 7-gate decision tree ends at `AB_TEST` as one of several outcomes.
- But "AB_TEST" is under-specified — should it be standard A/B, sequential, switchback, MVT, holdout?
- **Coach value-add:** A secondary methodology overlay after COMPASS lands on AB_TEST. See `methodology-compass.md` §2 for the criteria.

### 3. One-Tailed Testing PDF has a documented bug (CORRECTION NEEDED)
- The R script on p.7 of the one-tailed PDF uses `alternative = "two.sided"` and success message reads "treatment performs better than the control" — contradicting the one-tailed harm-detection workflow.
- **The Coach must override the user's verbatim code:** set `alternative = "less"` (or `"greater"`) and flip the success-message direction.
- Documented in `methodology-compass.md` §5.

### 4. Champion role exists in 1 of 6 VSs only (STRUCTURAL FRAGILITY)
- The "Champion pre-launch sign-off" hard gate is currently enforceable in only ONE VS (ISB, Katarzyna Korona).
- DRAFT_04's "20% time non-negotiable" is **not actually secured** with that VS lead.
- **Implication:** The Coach IS the operational lever that makes the gate real. Coach enforcement = de-facto policy until the human Champion role scales.

### 5. The "enablement trap" (STRUCTURAL CRITIQUE)
- DRAFT_07 explicitly names enablement leads as the obstacle to enforcement — they optimize for survival because they have responsibility without authority.
- **Implication:** Coach must be system-level enforcement, not "AI advice that humans can ignore."

### 6. the A/B testing platform Rollout Policy is already-in-force, not aspirational (POLICY CLARIFICATION)
- 5-requirement exception framework, 3-month cap, named approvers (PO + Experimentation Lead), Knight Capital cautionary reference.
- Treat as the most concrete governance artifact in the corpus — DRAFTs are aspirational, this is policy.

### 7. DRAFT_06 vs DRAFT_10 are framings, not contradictions (RESOLVED)
- Same 3 conflict types, 3 solutions, 5 governance rules.
- DRAFT_06 leads with risk; DRAFT_10 leads with velocity.
- **Coach guidance:** Open with DRAFT_10's velocity framing; cite DRAFT_06's taxonomy when explaining how conflicts are resolved.

### 8. Hypothesis Coach V0 and Eval Playbook are content-identical (DEDUP)
- Both are the same Digital Hangar @ LHG document.
- **Coach guidance:** Cite the v3 Eval Playbook only when attributing quotes; treat V0 as the same source.

### 9. The canonical "gold" example in the playbook has no Source (BUG IN SOURCE DOC)
- The "change blue to green" gold example on Eval Playbook p.9 would score 0–1 on Dimension 1 (Source) — it has none.
- **Coach guidance:** When citing this example, add a synthetic source ("based on click-map analysis showing X") so users don't learn to skip Source grounding.

### 10. Verification (Dim 5) and Motivation (Dim 6) are thinly covered (GAP)
- The Thomke 6-dim framework's Verification and Motivation dimensions have **almost no worked examples** across the entire corpus.
- **Implication:** When the Coach extends LLM grading beyond Source (Dim 1) and Specificity (Dim 2), the prompt-writers will need to commission examples for Dims 5 + 6. Eval cases needed.

---

## Suggested wiring path (Stage 2)

The knowledge files are static markdown. Two ways to get them into the LLM:

**Option A — Append-to-prompt (simplest)**
For each criterion route in `coach/src/routes/`, the route reads the relevant knowledge file via `fs.readFileSync` and concatenates it into the `system` prompt under a `<knowledge>` section. Works today, no new infra.

**Option B — RAG retrieval (future)**
Embed each knowledge file by section. At runtime, retrieve top-k chunks relevant to the user's input. Better cost/quality trade-off as the corpus grows.

**Recommendation:** Start with Option A for the Source criterion. The prompt at `coach/src/prompts/hypothesis-dimension-1-source/v1.md` should append `hypothesis-quality.md` §3 (examples) + §4 (falsifiability) + §6 (quotes) — bumps the prompt size but Anthropic prompt caching (already wired in `score-hypothesis-source.ts` via `cache_control: { type: 'ephemeral' }`) keeps the per-call cost flat after the first hit.

---

## Source attribution

Every claim in the knowledge files is attributed `[source: <filename>, p.X]` to a file in `projects/exp-os/content/knowledge/AirGroup/`. Verbatim quotes use `> "..."` blocks. When the Coach cites back to the user, it should preserve attribution.

---

Related memory: [[project-coach-v2-state]], [[reference-coach-artifacts]], [[reference-coach-kb-swarm]].

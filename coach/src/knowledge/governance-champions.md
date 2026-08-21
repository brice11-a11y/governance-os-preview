---
title: Governance, Champions, Operating Model
sources:
  - DRAFT_03_Center_of_Excellence_Model.md — CoE model variant focused on team-level structure (centralized vs. decentralized vs. CoE-with-distributed-execution)
  - DRAFT_03_Center_of_Excellence_and_Champions.md — Expanded CoE draft that merges champion role into CoE chapter (covers responsibilities, time, diagnostic)
  - DRAFT_04_Champion_Framework_and_Roles.md — Champion-only draft. Six responsibilities, time allocation, "Don't Know / Can't Do / Don't Trust" diagnostic
  - DRAFT_04_Scaling_Maturity.md — Maturity model v1: four levers, radar mapping (Accountable / Active / First exp performed / Trained)
  - DRAFT_05_Scaling_Maturity.md — Maturity model v2: same four levers, radar order tweaked (Accountable / First exp / Active / Trained)
  - DRAFT_07_From_Hope_Based_to_Enforced_Governance.md — Hope vs. enforced governance, the "two clicks" trap, 5-dim process quality scoring
  - DRAFT_09_Leading_Experimentation_Culture_Change.md — Success theatre, HARKing, vocabulary reform, five-question leadership audit
  - Experimentation Operating Model - RASCI Redesign.md — May 2026 RASCI redesign with Bashe/Andreas; tiered support model, transition plan
  - Experimentation Champion - Framewok.pdf — Slide deck on champion role POC, scale traps, step-by-step approach (Q4-Q2'26)
  - Champion Framework Experimentation Chapter v3.pdf — Formal Champion role doc (Apr 2026): 6-responsibility table, time split, current champions list
  - Experimentation Governance Rollout Policy.pdf — the A/B testing platform rollout policy: why winning tests must not stay live at 100%, exception framework
last_extracted: 2026-05-27
extracted_by: subagent (Coach knowledge swarm)
---

# Governance, Champions, Operating Model

## 1. Hard gates (what the Coach must enforce)

These are the deterministic, non-negotiable checks the Coach should apply before allowing an experiment to be marked "ready to launch." Each gate has a *what*, a *why* (sourced), and an *action* (block vs. warn).

### Gate 1 — Structured hypothesis (BLOCK)
**What:** A hypothesis written in the standard template (population, change, predicted effect, mechanism, metric). No free-form "improve UX" allowed.
**Why:** *"When the system requires a structured hypothesis before an experiment can proceed, you do not need to hope people will write one. The Hypothesis Coach can assist, but the gate is the system, not the person."* — DRAFT_07
**Action:** Block. The Coach refuses to advance the experiment past intake.

### Gate 2 — One primary metric, pre-committed (BLOCK)
**What:** Exactly one primary metric, declared before launch, tied to a business objective.
**Why:** The most common HARKing mechanism is "metric shopping" — *"71% had been manipulated through metric shopping"* in the audited program (DRAFT_09). Multiple primaries enable post-hoc selection.
**Action:** Block. If >1 primary metric is declared, force the team to pick one and demote others to secondary.

### Gate 3 — Power calculation / sample size attached (BLOCK)
**What:** Sample size calculated upfront, with MDE (minimum detectable effect), baseline rate, alpha, and power explicitly stated.
**Why:** *"Was the sample size calculated upfront? ... Penalize experiments that change metrics mid-flight, stop early on positive results, or ignore seasonality."* — DRAFT_07 (process quality scoring, methodological rigor dimension, 25% weight). Maturity lever 4 also requires it: *"Is sample size calculated upfront?"* — DRAFT_05.
**Action:** Block. No power calc = experiment cannot launch.

### Gate 4 — Guardrails defined before launch (BLOCK)
**What:** At least one guardrail metric explicitly named, with the threshold that would trigger a stop/rollback.
**Why:** *"Are guardrails defined before launch?"* is one of the four maturity levers (DRAFT_05). And: *"Own the monitoring of guardrail metrics during live tests. Ensure the team understands that if a test breaks conversion rate, that's their responsibility."* — DRAFT_04 Champion responsibility #5.
**Action:** Block.

### Gate 5 — Pre-committed decision rule (BLOCK)
**What:** Written agreement, before launch, on what action will be taken for each outcome (validated / not validated / no significant difference). Stopping rules defined.
**Why:** *"Decision protocols registered before launch. When what happens with results is agreed before anyone sees the data, you do not need to hope someone will remember what was agreed."* — DRAFT_07. And: *"Were stopping rules defined?"* — DRAFT_07 scoring.
**Action:** Block.

### Gate 6 — Conflict / overlap check (BLOCK)
**What:** Confirmation that no other active or planned test overlaps on the same page/component or population.
**Why:** *"Automated conflict detection. When collisions between concurrent experiments are detected by the system rather than by chance conversations, you do not need to hope teams will coordinate."* — DRAFT_07. Reinforced by the the A/B testing platform Rollout Policy: *"A hidden 100% the A/B testing platform variant changes that baseline without anyone knowing."*
**Action:** Block (if active conflict) or Warn (if planned conflict, escalate to Champion).

### Gate 7 — Champion pre-launch sign-off (BLOCK)
**What:** The VS-embedded Champion has reviewed and approved the experiment before it goes live.
**Why:** *"Pre-launch sign-off | NEW | Hard requirement: no test goes live without sign-off"* — RASCI Redesign §3, delta table. The ISB champion already enforces this for 90% of test volume.
**Action:** Block. No champion sign-off = experiment cannot launch. If a VS has no champion, fallback policy applies: cap throughput in that VS (RASCI Redesign §8, decision #2 recommendation).

### Gate 8 — Pre-registration timestamp (BLOCK)
**What:** Hypothesis, primary metric, sample size, guardrails, and decision rule timestamped and locked before any data is collected.
**Why:** HARKing prevention. *"71% had been manipulated through metric shopping, 45% stopped early when trending positive, 83% had success criteria modified after results"* — DRAFT_09. Pre-registration is the only mechanism that makes these manipulations detectable.
**Action:** Block. The system records the timestamp; any later change to primary metric / decision rule requires re-approval.

### Gate 9 — Documented conclusion of previous experiment (BLOCK)
**What:** A team cannot start a new experiment until the previous one in the same area has a documented conclusion in the repository.
**Why:** *"Documented conclusions as a gate. When the system blocks new experiments until previous ones are properly concluded, you do not need to hope analysts will close the loop."* — DRAFT_07. And: *"Documentation. Non-negotiable, enforced as a gate before any new test can start."* — DRAFT_03 (Champions variant).
**Action:** Block.

### Gate 10 — Deployment path for winners (WARN, escalate)
**What:** A winning experiment must be implemented via CMS or feature flag within the current sprint cycle. Staying live on the A/B testing platform at 100% requires the exception framework (commercial justification, implementation cost comparison, expiry date max 3 months, conflict check, visibility tag).
**Why:** *"the A/B testing platform is our testing tool, not our deployment tool."* and *"One exception becomes the default. Allowing one team to skip proper implementation signals to every other team that the A/B testing platform is an acceptable shortcut for production changes."* — the A/B testing platform Rollout Policy §1.3 and §2.
**Action:** Warn at experiment-end. Require PO + Experimentation Lead approval if exception requested.

---

## 2. Champion framework — roles & responsibilities

### What a Champion is (AirGroup-specific definition)
A Champion is a team member — *"typically a product owner, business analyst, or data analyst"* (DRAFT_03 variant) — who takes on experimentation responsibilities **alongside their regular role**. They are **T-shaped**: deep expertise in their product domain, working knowledge of experimentation methodology (DRAFT_04).

They are **not** full-time experimentation specialists. They are **"multipliers. Scale is the keyword"** (Champion Framework Chapter v3 PDF, §Objective).

The role was formally introduced **Summer 2025** (Champion Framework PDF). The first POC ran in **Q4 2025 with ISB** (Champion Framework — Scaling Recipe PDF, p.14). The ISB Champion is **Katarzyna Korona (Cognizant)** and has been active for 6+ months handling 90% of test volume (RASCI Redesign §3).

### The six responsibilities (canonical list)

From the Champion Framework Chapter v3 PDF §2 (also mirrored in DRAFT_04 and DRAFT_03 variant):

| Area | Responsibility |
|---|---|
| **Quality of Experiments** | Ensure adherence to standardized design, bias assessment, documentation, and decision-making practices. Final call on whether a hypothesis is ready. |
| **Process & Visibility** | Ensure the experimentation process is correctly applied: ticket creation, tracking, visibility across tests. Local enforcer of the golden rules. |
| **Experimentation Planning** | Represent experimentation during **PI Planning**; align test roadmap with product roadmap and capacity. Prevent "test everything, learn nothing." |
| **Knowledge Sharing** | First-line contact for experimentation within the team; share learnings via Confluence/DocSpace. Knowledge broker between CoE and team. |
| **Guardrails & Metrics** | Alongside DAs, monitor ongoing tests, flag anomalies, ensure correct implementation of guardrails and validated metrics. |
| **Continuous Enablement** | Identify blockers and training needs; propose hackathons or onboarding sessions for team upskilling. |

### Operational scope (POC version, Champion Framework PDF p.11)
- Answer first questions on experimentations (Tier 1.5 in tiered support)
- Be the **Voice of Experimentation** during PI Planning
- **Weekly Review of Live Tests** (this was the most critical informal absorption — see RASCI §3)
- Ensure consistency of ways of working with process
- Be the in-team Expert on technical topics like Significance

### Pre-launch sign-off — the hard gate
*"No test goes live without champion approval"* — RASCI Redesign §5, Champions ownership table. This is the single most important deterministic gate the Champion owns. The Coach should treat "Champion sign-off" as a binary, non-overridable check.

### What Champions are NOT responsible for
- **Generating hypotheses for the team.** *"They know their product, their users, and their data better than anyone. The central team cannot and should not generate hypotheses for them."* — DRAFT_03
- **Setting up the experimentation platform / architecture.** That's Platform (Tier 3) — Bashe/Andreas in current ops, with Andreas as the long-term owner (RASCI §5).
- **Vendor escalation to the A/B testing platform.** That's Tier 2 (Offshore FTE) → Tier 3 (Platform).
- **Statistical PhD-level work.** *"Not statistics PhD level, but solid: hypothesis design, significance, power, bias types, sample ratio mismatch, the peeking problem."* — DRAFT_04 §Required skills.

### Time allocation (canonical split, Champion Framework PDF p.7)

| Activity | Champion | Data analyst |
|---|---|---|
| Champion responsibilities | 20% | — |
| CoP / overarching tasks | 10% | 20% |
| Experimentation planning | 10% (implicit) | 20% |
| Regular product work | 60% | 60% |
| Buffer | — (10% in DRAFT_03) | — |

**The 20% is non-negotiable.** *"If a champion doesn't have at least one day per week for experimentation governance, the role is meaningless. This needs to be agreed with the team lead and visible in sprint planning."* — DRAFT_04. As of May 2026, the ISB champion's time is **not formally secured with the VS lead** (RASCI §3) — this is the #1 P0 risk.

### Required skills (Champion Framework PDF §4)
- Deep understanding of experimentation methodology (design, significance, bias), confirmed by completion of the **Pluralsight Experimentation Champion training** (20h program, RASCI §3)
- Familiarity with the A/B testing platform & other experimentation analysis tools
- Plus, from DRAFT_04: communication skills (translation layer between PMs and DAs) and **assertiveness** (saying "this test is not ready" to one's own team)

### The "Don't Know / Can't Do / Don't Trust" diagnostic
When a team is not experimenting, the Champion's diagnostic job is to identify which of three buckets applies:

- **Don't Know** → training problem. Fix: onboarding cohorts, learning center, Pluralsight modules.
- **Can't Do** → infrastructure problem. Fix: platform access, pairing with CoE for complex setups.
- **Don't Trust** → leadership problem. Fix: "no significance, no go-live" policy, leadership buy-in.

> "Don't Know is a training problem. Can't Do is an infrastructure problem. Don't Trust is a leadership problem. Champions diagnose which one is blocking their team." — DRAFT_04

### When to escalate to a Champion vs. to CoE
- **To Champion (Tier 1.5):** Stream-specific test design questions, pre-launch sign-off, local quality issues, knowledge sharing within VS.
- **To Offshore FTE (Tier 2):** Technical the A/B testing platform questions, escalations from Champion that need tool expertise.
- **To Platform / CoE (Tier 3):** Architecture decisions, vendor escalations, personalization setup, cross-VS standards questions.

(Source: RASCI Redesign §4.2 tiered support table.)

### Current Champions (as of April 2026)
| Value Stream | Champion |
|---|---|
| ISB | Korona, Katarzyna (Cognizant) |
| PPL | Pending |
| ANC, TEX, CS, OPS | No champion |

(Source: Champion Framework Chapter v3 PDF §5.)

---

## 3. Center of Excellence (CoE) model

### What the CoE is at LH
The CoE is **not a testing team**. *"It's an enablement team. The shift in identity matters. You stop being the people who run tests and start being the people who make testing possible for everyone else."* — DRAFT_03.

LH operates **Model 3: Center of Excellence with distributed execution** (also called "disciplined decentralization") — *"the only model I've seen work at scale."* — DRAFT_03.

The two failed alternatives (DRAFT_03):
- **Centralized:** doesn't scale. A team of 5 cannot support 60 product teams. Becomes a service desk.
- **Fully decentralized:** quality collapses without governance. *"78% of decentralized experiments had methodology flaws, over half were duplicates of previous tests, and only 11% were properly implemented after showing positive results."*

### What the CoE owns (central)
- **Methodology and standards** — what counts as a valid hypothesis, mandatory guardrails, statistical thresholds, documentation rules. Enforced through tooling and process gates.
- **Tooling and infrastructure** — the platform, power calculator, results dashboard, experiment repository.
- **Governance and quality** — process compliance monitoring, quarterly retros, zombie-test flagging, "no significance, no go-live" enforcement.
- **Training and onboarding** — learning center, onboarding cohorts, documentation, hackathons.
- **AI-assisted tools** — the Hypothesis Coach, Testing Compass, Related Tests agent.

### What product teams own (distributed)
Hypothesis generation, test execution, decision-making (within the governance framework), documentation.

### Relationship Champion ↔ CoE
*"Champions bridge the gap between central strategy and local execution. They sit within product teams but have a direct line to the CoE. They enforce standards locally, escalate quality issues, and share knowledge across teams."* — DRAFT_03 / DRAFT_04.

The Champion is **the operational arm of the CoE inside each VS**. Without champions, *"the CoE sets standards that nobody follows and writes playbooks that nobody reads."* — DRAFT_04.

### Decision authority
- CoE: sets the rules (methodology, gate criteria, sign-off definition).
- Champion: applies the rules locally, has authority to **block** a test that doesn't meet criteria.
- Product team: decides to ship based on results, within the CoE framework.
- Leadership: provides the "no significance, no go-live" mandate that gives the CoE/Champion teeth.

### CoE failure modes to avoid (DRAFT_03)
- Becomes a service desk (queue, not capability).
- Champions exist on paper only (no time allocation).
- No community of practice (champions burn out in isolation).
- Governance is hope-based (standards as documents, not as tooling gates).
- Leadership doesn't see the value (no quarterly commercial narrative).

---

## 4. RASCI / operating model

Source: `Experimentation Operating Model - RASCI Redesign.md` (May 2026, Bashe + Andreas + Brice).

### Current state (May 2026)
The team is mid-transition from the **Summer 2025 RACI** to a **new RASCI** because Platform (Bashe/Andreas) scope expanded from A/B testing to the full Data Ecosystem (Ingestion, Unification, Intelligence, Activation). Platform was previously absorbing ~15–22 hrs/week on experimentation-specific work — that bandwidth is gone.

### The new ownership split (proposed)

**CoP (Brice + Kate) owns:**
- Guidelines and guardrails
- Async training (methodology, role-based, onboarding)
- Tuesday biweekly "Talk about Experimentation"
- Knowledge base (feeds AI Q&A tool — Tier 1)
- Escalation routing rules
- Champion routines (cadence, agenda, quality checklists)
- Weekly review of live tests — **framework only** (Champions execute)
- Pre-launch sign-off — **criteria only** (Champions apply)
- Data quality auditing framework
- DA access management
- Monthly provider alignment (strategic)

**Platform (Bashe/Andreas) owns:**
- Live technical training (dev-specific, tool deep-dives)
- Tool roll-out (new tool from RFP)
- Tool migrations documentation
- Communication lead on tool changes
- Non-DA access management
- **Tier 3 ad hoc support** (architecture, vendor escalation, personalization)
- Biweekly Platform-CoP sync (co-owned with CoP)

**Offshore FTEs (Inboo + colleague) own:**
- Monday biweekly Q&A round (after transition from Platform)
- **Tier 2 ad hoc support** (technical the A/B testing platform questions)
- Technical deep-dives (1:1 investigations)
- Weekly the A/B testing platform provider call
- Tool-level data quality auditing

**Champions (VS-embedded) own:**
- Weekly review of live tests **in their VS**
- **Pre-launch sign-off in their VS** (hard gate)
- **Tier 1.5 ad hoc support** (stream-specific, same-day)
- Scaling testing volume in their VS

**Product Teams (PO / Dev / DA) own:**
- Using the AI Q&A tool (Tier 1) as first stop
- Submitting tests for pre-launch sign-off
- Requesting access (via CoP for DA, Platform for non-DA)

### Tiered support model (RASCI §4.2)

| Tier | Who | Scope | SLA |
|---|---|---|---|
| 1 | AI Q&A tool | Standard questions (setup, config, methodology) | Instant |
| 1.5 | Champion (VS) | Stream-specific, test design review | Same day |
| 2 | Offshore FTE | Technical the A/B testing platform, escalations | 48h |
| 3 | Platform (Bashe/Andreas) | Architecture, vendor escalation, personalization | Per case |

### Where ambiguity remains (RASCI §8, decisions still open)
1. **Knowledge base ownership** — proposed CL accountable, Platform contributes. Decision needed.
2. **Fallback when a VS has no champion** — recommendation: cap test throughput in that VS (vs. CL absorbing, vs. blocking launches).
3. **Personalization support** — permanent Tier 3 or build into Tier 2 over time?
4. **Offshore FTE bandwidth on experimentation specifically** — currently unknown, shared with full data platform.
5. **Reporting line for offshore** — does CoP have visibility into their workload?

---

## 5. Maturity model

### LH's maturity framework (DRAFT_04/05, four levers)

Maturity is **not** measured by team size, test volume, or tooling sophistication. The acid test:
> *"Do executives cite specific experiments that changed their mind on important decisions?"* — DRAFT_05

If yes → mature. If "they attend the review meeting" → not yet. Passive attendance is not buy-in.

**Four levers:**
1. **Decision-making & leadership** — Do experiment results actually drive shipping decisions? "No significance, no go-live"? Does leadership ask "what did we test?" before signing off?
2. **Process** — Enforced (not just documented)? Pre-registered? Results documented? Communication protocol?
3. **Infrastructure & tools** — Unified platform (not a Frankenstack)? Guardrails, automated notifications, quality gates? Self-serve without sacrificing governance?
4. **Experiment setup & management** — Teams know how to design tests? Sample size upfront? Guardrails defined before launch? Champions in place?

### Maturity radar (per VS, plotted quarterly)
The two DRAFT files give slightly different ring orderings — synthesizing:
- **Accountable** (inner) — team has acknowledged experimentation as part of their process
- **First experimentation performed** — completed at least one proper experiment end-to-end with documented results
- **Active** — regularly runs experiments as part of development cycle
- **Trained** (outer) — completed experimentation training and has a designated champion

Plot each VS on the radar each quarter. If a VS is stuck at "accountable" for three quarters → apply the Don't Know / Can't Do / Don't Trust diagnostic.

### Industry maturity bands (for reference — Speero 2025 Report, cited in Champion Framework PDF p.9)
"Center of Excellence" team structure usage by program maturity:
- Beginner: 0% CoE
- Aspiring: 12%
- Progressive: 8%
- Strategic: 19%
- Transformative: 29%

CoE adoption is the dominant signal of "Transformative" maturity. LH is targeting this band.

### Where LH currently sits (mid-2026 signals)
- 500+ tests/year today, ambition to reach 1,500/year (the A/B testing platform Rollout Policy §1.4; RASCI §1).
- Operational target: DAs running **3+ tests per product per week autonomously** (RASCI §1).
- 1 Champion in place (ISB), 1 pending (PPL), 4 VSs without (ANC, TEX, CS, OPS).
- Per the "Scale Trap" chart (Champion Framework — Scaling Recipe PDF p.4): % of features AB tested is rising from <50% (2023) to ~100% (2027), and **test quality is currently declining** ("we're here" marker, 2025) — the champion model is the corrective lever.

### Path from 150 to 1,500 tests (six levers, sequenced)
**Quick wins (low cost):**
1. Leadership mandate ("every significant feature ships with test evidence")
2. Governance OS (enforce hypothesis quality + decision rules through system design)

**Scale initiatives (higher effort):**
3. Full team rollout (champion model + onboarding cohorts)
4. Pairing model (central analysts pair for first 2-3 experiments, hand off to local champion)
5. Infrastructure & new domains (native app, server-side)
6. Alternative experimental designs (switchback, quasi-experimental)

> *"The key insight: methodology and governance levers activate before technical infrastructure levers. Fix the operating model first, then invest in tools."* — DRAFT_05

---

## 6. From hope-based to enforced governance

### The shift narrative (DRAFT_07)

**Hope-based governance** — "the organization has principles, a playbook, maybe even a CoE with a name and a Slack channel. But there is no system ensuring any of it is followed." Compliance is never measured. Quality standards exist but nothing prevents substandard experiments from running.

**Enforced governance** — *"In finance, you do not hope people will follow spending policies. You build systems that enforce them. In engineering, you do not hope people will write tests. You build pipelines that require them. Experimentation is the only function where organizations still believe that a playbook and a positive attitude are sufficient governance."*

### The four mechanisms of enforcement (DRAFT_07)
1. **Mandatory fields, not optional templates** — the system blocks until a structured hypothesis is provided. (This is what the Coach implements.)
2. **Automated conflict detection** — the system detects collisions between concurrent experiments.
3. **Decision protocols registered before launch** — agreed before anyone sees the data.
4. **Documented conclusions as a gate** — no new experiment can start until the previous one is closed.

### The "two clicks" trap
The most important rhetorical argument the Coach can deploy when teams complain about friction:

> *"Now consider what 'two clicks' actually represents. Someone opens the testing tool, creates an experiment, and runs it. No one checked whether the hypothesis was sound. No one knows if another team tested the same thing last quarter. No one agreed what would happen with the results before the test started. ... That is not a two-click process. That is a forty-five minute workflow spread across five different tools, multiple communication channels, and at least one meeting that produced no documented output."* — DRAFT_07

### The enablement trap
Why enablement leads themselves often resist enforcement:
> *"They have the title but not the authority. They can recommend but not require. ... So they optimize for survival rather than standards. They position themselves as facilitators rather than governors. They avoid mandates because mandates create conflict."* — DRAFT_07

This is **structural, not personal**. The Coach must be the system-level enforcement that the enablement lead cannot personally provide.

### Process quality scoring (DRAFT_07 — five dimensions)
Note: DRAFT_07 describes a 5-dimension scoring framework (predates v1.1 100+100). The v1.1 framework in `Experiment Quality Scoring Framework.md` supersedes this for current use, but the rationale below is still load-bearing.

| Dimension | Weight | What it checks |
|---|---|---|
| Strategic alignment & hypothesis quality | 25% | Connection to business objectives; specificity |
| Methodological rigor | 25% | Sample size upfront, bias ID, duration, stopping rules |
| Stakeholder engagement & communication | 15% | Pre-launch comms; business-language results |
| Implementation planning | 20% | Feasibility, resources, rollout strategy upfront |
| Knowledge capture | 15% | Documentation, connection to prior experiments |

Set minimum floors (e.g., 70% on strategic alignment + implementation planning) before approving.

---

## 7. Culture change

### Success theatre — the core problem (DRAFT_09)
> *"The experimentation industry has a truth problem. Walk into any team's quarterly review and you will hear the same performance: 'We achieved a 38% success rate!' ... But ask a different question, 'Which strategic decisions did your experiments influence?', and watch the confident presentation crumble into awkward silence."*

The HARKing audit cited in DRAFT_09 (program with 67 "successful" experiments over 2 years):
- 71% had been manipulated through metric shopping
- 45% stopped early when trending positive
- 83% had success criteria modified after results
- Only 12% were properly implemented

### Vocabulary reform (mandatory for the Coach)
**Never say:** "successful" / "failed" / "won" / "lost" experiment.
**Always say:**
- **Hypothesis validated** — results support the hypothesis with statistical confidence
- **Hypothesis not validated** — results contradict the hypothesis with statistical confidence
- **No significant difference** — results show no statistically meaningful difference (boundary intelligence, not failure)

> *"An invalidated hypothesis that prevents a million-dollar mistake is more valuable than a validated hypothesis about button colors."* — DRAFT_09

### Common resistance patterns
- "That's a lot of clicks" → see "two clicks trap" §6 above. The friction *is* the governance.
- "We need flexibility for this case" → the the A/B testing platform exception framework is the bounded answer.
- "Our test was successful, we should ship now" → reframe with the three outcomes, demand pre-committed decision rule.
- "Leadership ignores our results anyway" → Don't Trust bucket; escalate to leadership audit (§5 questions of DRAFT_09).

### What leadership must do (DRAFT_09)
1. Set strategic learning objectives (specific, not "improve UX")
2. Establish the governance framework (standards for hypothesis, sample sizes, implementation decisions)
3. Provide implementation authority (clear path from insight to decision)
4. Create psychological safety (celebrate clear negative results, recognize methodology over outcome)
5. Ask the right questions ("What did we test? What did we learn?" before signing off on any feature)

### The five-question leadership audit
Used by Coach to identify whether a stuck experiment is actually a leadership problem:
1. **Strategic alignment** — do experiments connect directly to business objectives?
2. **Decision authority** — clear process for implementation?
3. **Resource adequacy** — sufficient budget, time, technical resources for meaningful hypotheses?
4. **Psychological safety** — comfortable testing bold hypotheses that might fail?
5. **Knowledge integration** — do insights inform strategic planning?

### From buried/technical/isolated to visible/strategic/integrated
The "learning lie" fix:
- **Buried → visible** — learnings accessible at the moment of decision, not in 47-slide decks
- **Technical → strategic** — "15% conversion lift" becomes "Premium pricing with payment plans increases revenue 15% without reducing market share"
- **Isolated → integrated** — decision protocols requiring experimental evidence; learning repositories organized by strategic question, not chronology

---

## 8. Governance rollout policy (the A/B testing platform-specific)

Source: `Experimentation Governance Rollout Policy.pdf`.

### Default rule
> *"A winning experiment is implemented via CMS or feature flag within the current sprint cycle. the A/B testing platform is our testing tool, not our deployment tool."*

### Why winning tests cannot stay live on the A/B testing platform at 100% (four reasons)
1. **Flag debt accumulates invisibly** — A 100% variant in the A/B testing platform is invisible to deployment/security/release teams. Multiply across 60+ product teams → unmanageable.
2. **Silent conflicts break future tests** — Hidden 100% variant changes baseline. New features layer on top of forgotten modifications → unreliable results or broken UX.
3. **One exception becomes the default** — "If one team is allowed to do it, all teams will follow. Governance erodes not through one decision, but through the precedent it sets."
4. **Operational risk at scale** — At 1,500 tests/year, even small % of "permanent" the A/B testing platform variants → significant operational surface area. Same class of risk as Knight Capital.

### Exception framework (max 3 months, with re-approval)

| Requirement | What the team must provide | Approver |
|---|---|---|
| Commercial justification | Documented statistically significant uplift + projected revenue impact if delayed | Product Owner + Experimentation Lead |
| Implementation cost comparison | Written estimate: CMS/feature-flag impl vs. keeping the A/B testing platform variant. Timeline for each option. | Experimentation Lead |
| Expiry date | **Maximum 3-month extension**. Hard deadline for proper impl or retirement. No renewals without re-approval. | Experimentation Lead |
| Conflict check | Confirmation variant does not overlap with any other active/planned test on same page/component. | Experimentation Lead |
| Visibility | Variant registered in shared tracker with status "Extended — pending implementation". | Experimentation Lead |

### Phased rollout / compliance timeline (from RASCI §7)
- **Weeks 1–4 (Stabilize):** ISB Champion formally owns weekly quality review. Fallback policy for VSs without champions agreed. Offshore FTE shadows Monday Q&A.
- **Weeks 5–8 (Build):** Second champion onboarded. AI Q&A knowledge base expanded. Pre-launch sign-off documented and enforced for ISB. Quality dashboard v1 live for ISB.
- **Weeks 9–12 (Scale):** Tiered support model fully operational. **Pre-launch sign-off extended to all VSs with champions.** First champion cohort completes 20h Plura training.

---

## 9. Useful quotes (verbatim, for Coach citation)

> "Mandatory fields, not optional templates. When the system requires a structured hypothesis before an experiment can proceed, you do not need to hope people will write one." — DRAFT_07_From_Hope_Based_to_Enforced_Governance.md

> "Decision protocols registered before launch. When what happens with results is agreed before anyone sees the data, you do not need to hope someone will remember what was agreed." — DRAFT_07

> "In finance, you do not hope people will follow spending policies. You build systems that enforce them. In engineering, you do not hope people will write tests. You build pipelines that require them. Experimentation is the only function where organizations still believe that a playbook and a positive attitude are sufficient governance." — DRAFT_07

> "Hope is not governance. Systems are." — DRAFT_07

> "That is not a two-click process. That is a forty-five minute workflow spread across five different tools, multiple communication channels, and at least one meeting that produced no documented output." — DRAFT_07

> "The clicks they want to avoid are the ones that would replace all of that hidden mess with something structured." — DRAFT_07

> "Champions bridge that gap. They sit within product teams but have a direct line to the CoE. They enforce standards locally, escalate quality issues, and share knowledge across teams." — DRAFT_03_Center_of_Excellence_and_Champions.md

> "Don't Know is a training problem. Can't Do is an infrastructure problem. Don't Trust is a leadership problem. Champions diagnose which one is blocking their team." — DRAFT_04_Champion_Framework_and_Roles.md

> "If a champion doesn't have at least one day per week for experimentation governance, the role is meaningless." — DRAFT_04

> "The champion sometimes needs to say 'this test is not ready' to their own team. That requires both competence and confidence." — DRAFT_04

> "Hard requirement: no test goes live without sign-off." — Experimentation Operating Model - RASCI Redesign.md §3 (delta table, "Pre-launch sign-off" row)

> "Do executives cite specific experiments that changed their mind on important decisions? If the answer is yes, you're mature. If the answer is 'they attend the review meeting' or 'they like the dashboard,' you're not there yet. Passive attendance is not buy-in." — DRAFT_05_Scaling_Maturity.md

> "True maturity is not about volume, team size, or tools. It's about the percentage of experiments that actually influence strategic decisions." — DRAFT_04_Scaling_Maturity.md

> "Methodology and governance levers activate before technical infrastructure levers. Fix the operating model first, then invest in tools." — DRAFT_05

> "Stop saying 'successful' and 'failed' experiments. Start saying 'hypothesis validated,' 'hypothesis not validated,' and 'no significant difference.' This is not a semantic game. It is a governance transformation that separates strategic programs from theatrical ones." — DRAFT_09_Leading_Experimentation_Culture_Change.md

> "An invalidated hypothesis that prevents a million-dollar mistake is more valuable than a validated hypothesis about button colors." — DRAFT_09

> "Culture change is not about inspiring people to value experimentation. It is about building systems that make experimentation valuable." — DRAFT_09

> "71% had been manipulated through metric shopping, 45% stopped early when trending positive, 83% had success criteria modified after results, and only 12% were properly implemented." — DRAFT_09 (audit of a 67-experiment "success" program)

> "the A/B testing platform is our testing tool, not our deployment tool." — Experimentation Governance Rollout Policy.pdf §2 (Default rule)

> "Allowing one team to skip proper implementation signals to every other team that the A/B testing platform is an acceptable shortcut for production changes. Governance erodes not through one decision, but through the precedent it sets." — Experimentation Governance Rollout Policy.pdf §1.3

> "The CoE is not a testing team. It's an enablement team. The shift in identity matters. You stop being the people who run tests and start being the people who make testing possible for everyone else." — DRAFT_03_Center_of_Excellence_Model.md

> "Act as multipliers. Scale is the keyword." — Champion Framework Experimentation Chapter v3.pdf §Objective

---

## 10. Conflicts / gaps

### Conflict 1: Two DRAFT_03 files
There are two DRAFT_03 files with overlapping content:
- `DRAFT_03_Center_of_Excellence_Model.md` — leaner, scopes Champion to a one-paragraph teaser and defers to a separate Champion page.
- `DRAFT_03_Center_of_Excellence_and_Champions.md` — merged version that includes the full six-responsibility list, time allocation table, and Don't Know/Can't Do/Don't Trust diagnostic inside the CoE chapter.

**Resolution:** Treat the merged version as superseding the leaner one. The Champion-only DRAFT_04 has the same six responsibilities and is consistent.

### Conflict 2: Two DRAFT_04 files
- `DRAFT_04_Champion_Framework_and_Roles.md` — Champion-specific (matches Champion Framework Chapter v3 PDF).
- `DRAFT_04_Scaling_Maturity.md` — Maturity model (also has a `DRAFT_05_Scaling_Maturity.md` near-duplicate).

These are different topics, not conflicts. The naming collision is a workspace artifact, not a content conflict.

### Conflict 3: Maturity radar ring order (DRAFT_04 vs DRAFT_05)
- DRAFT_04 order: Accountable → Active → First exp performed → Trained
- DRAFT_05 order: Accountable → First exp performed → Active → Trained

**Resolution:** DRAFT_05 ordering is more logical (you perform one experiment before you "regularly run them"). Use DRAFT_05.

### Conflict 4: Process quality scoring vs. v1.1 framework
DRAFT_07 describes a 5-dimension scoring framework (Strategic alignment 25%, Methodological rigor 25%, Stakeholder 15%, Implementation 20%, Knowledge 15%). The current `Experiment Quality Scoring Framework.md` (v1.1) uses a different 100+100 pre/post structure with floors.

**Resolution:** v1.1 supersedes for scoring math. DRAFT_07 narrative is still valid as rationale for why scoring exists and why hope-based governance fails.

### Gap 1: Champion authority to block
DRAFT_04 lists as a failure mode: *"The champion has no authority. If the champion can flag a quality issue but has no mechanism to block a bad test from launching, the role is advisory only."* But the Champion Framework v3 PDF and the POC scope (Champion Framework Scaling Recipe PDF p.11) do not explicitly grant blocking authority.

The RASCI Redesign §5 implicitly grants it: *"Pre-launch sign-off (in their VS) | No test goes live without champion approval."* But this is **proposed**, not yet formally adopted by VS leads. Decision #2 in RASCI §8 still has "block test launches" as option (c), not the recommended option.

**Implication for Coach:** The Coach should enforce Champion sign-off as a hard gate even though organizationally this is still being formalized. The Coach IS the enforcement mechanism that makes the proposal real.

### Gap 2: Champion role for VSs without a champion
RASCI §8 decision #2 proposes capping throughput in VSs without a champion, but this is unresolved. If Coach applies the rule "no test goes live without champion sign-off" universally, it effectively implements option (c) "block test launches" by default.

**Implication for Coach:** Needs a configurable fallback per-VS. Default = block. Override (cap throughput, allow temporary CL sign-off) should require explicit VS-lead acknowledgment.

### Gap 3: Time allocation not yet secured
The 20% Champion time allocation is "not negotiable" per DRAFT_04 but the ISB Champion's time is **not formally secured with her VS lead** (RASCI §3, action #1, status "Not started"). This is a known P0 risk that the Coach cannot solve — it requires human escalation.

### Gap 4: Decision authority for exceptions
The the A/B testing platform Rollout Policy lists "Experimentation Lead" as approver for 4 of 5 exception requirements, but does not specify the escalation when the Experimentation Lead and Product Owner disagree on commercial justification. Treat as ambiguous; Coach should escalate to CoE Lead (Brice) when conflict detected.

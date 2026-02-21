# Rise LVL UP - Evidence Review (2026-02-21)

## Scope
Research for product strategy before implementation:
- focus timer and work-rest cycle
- habit building and bad-habit recovery
- RPG/gamification reward + penalty mechanics
- white/pink noise for concentration
- prompt architecture and safety practices (OpenAI)

## Parallel Research Streams ("subagents")

1. Focus cycle research  
Task: validate short focus sessions + break effectiveness.

2. Habit science + relapse prevention  
Task: identify methods that improve adherence and reduce dropout after a lapse.

3. Gamification and incentive design  
Task: check if points/levels/penalties improve sustained behavior.

4. Audio and concentration  
Task: verify white/pink noise effects and risk boundaries.

5. OpenAI prompt engineering patterns  
Task: gather robust prompt practices for in-app coaching flows.

## Findings and Product Rules

### A) Focus timer (Pomodoro-like)
- Micro-break meta-analysis shows small but significant gains in vigor and lower fatigue; performance gains depend on task type and break duration.
- Practical rule: default to a simple cycle (e.g., 30/5) but keep full customization.
- Practical rule: for high cognitive load, allow longer breaks and adaptive recommendations.

### B) Habit mode and bad-habit mode
- Implementation-intention studies ("if-then" plans) show consistent positive effects, including smoking/substance-related behaviors.
- Practical rule: each habit should have explicit `IF trigger -> THEN action`.
- Practical rule: use behavior-change structure (COM-B + BCT taxonomy) for feature design, not just random gamification ideas.

### C) Lapses, streaks, and penalties
- Logged intact streaks increase continued engagement; broken streak salience can reduce engagement.
- Loss-framed incentives can increase behavior short-term, but effects often decay after intervention.
- Practical rule: use soft penalties, not harsh punishment spirals.
- Practical rule: include recovery mechanics (grace window, recovery quest, streak repair) to prevent "all-or-nothing" dropout.

### D) Smoking and harmful-habit recovery
- WHO 2024 guidance supports combined behavioral + pharmacological support for tobacco cessation.
- Evidence for SMS support is stronger than generic app-only support in older Cochrane data; newer app studies are mixed.
- Practical rule: app should provide planning/tracking/coaching support and clear referral to medical care, not claim clinical treatment by itself.

### E) White/pink noise
- Meta-analysis in ADHD/elevated symptoms shows small benefit; in non-ADHD groups, white/pink noise can be neutral or negative.
- Practical rule: make noise optional and user-calibrated (volume + type + duration).
- Practical rule: include silence mode and quick toggle; do not force noise as default.

### F) Prompt architecture for coaching features
- OpenAI docs emphasize: precise instructions, role hierarchy, model snapshot pinning, and evals.
- GPT-5 guide emphasizes: reasoning-effort tuning, clear tool instructions, persistence boundaries, and progress preambles in agentic flows.
- Practical rule: keep prompts versioned, tested with evals, and safety-moderated.

## Direct Implications for Rise LVL UP MVP

1. Core loop should be minimal:
   - plan task
   - run focus session
   - mark done/not done
   - apply XP/penalty
   - log reflection and next step

2. Penalty system design:
   - small immediate penalty for missed commitments
   - recovery quest for rapid comeback
   - avoid irreversible streak destruction

3. Habit engine:
   - daily check-in with `if-then` plan
   - cue tracking + completion outcome
   - relapse-safe flow (no shame loops)

4. Noise engine:
   - white/pink/brown/silence
   - default off
   - per-session or always-on options

5. AI prompt subsystem:
   - prompt templates in repo
   - prompt versions + eval checklist
   - strict boundaries for high-risk advice

## Sources

- Micro-break meta-analysis (PLOS ONE, 2022): https://pubmed.ncbi.nlm.nih.gov/36044424/
- Gamification PA meta-analysis (JMIR, 2022): https://pubmed.ncbi.nlm.nih.gov/34982715/
- Health apps with/without gamification meta-analysis (EClinicalMedicine, 2024): https://pubmed.ncbi.nlm.nih.gov/39764571/
- BE ACTIVE RCT (financial incentives + gamification): https://pubmed.ncbi.nlm.nih.gov/38583084/
- Veteran RCT (loss-framed + gamification): https://pubmed.ncbi.nlm.nih.gov/34241628/
- ACTIVE REWARD trial (IHD): https://pmc.ncbi.nlm.nih.gov/articles/PMC6220554/
- Implementation intentions for substance use meta-analysis: https://pubmed.ncbi.nlm.nih.gov/32622228/
- Implementation intentions for smoking cessation meta-analysis: https://pubmed.ncbi.nlm.nih.gov/31414843/
- BCT taxonomy v1 (93 techniques): https://pubmed.ncbi.nlm.nih.gov/23512568/
- COM-B / Behaviour Change Wheel: https://pubmed.ncbi.nlm.nih.gov/21513547/
- WHO clinical tobacco cessation guideline (2024): https://www.who.int/publications/i/item/9789240096431
- WHO cessation guideline announcement (2024): https://www.who.int/news/item/02-07-2024-who-releases-first-ever-clinical-treatment-guideline-for-tobacco-cessation-in-adults
- Cochrane mobile interventions for smoking cessation (2019): https://pubmed.ncbi.nlm.nih.gov/31638271/
- Smartphone app cessation meta-analysis (2023): https://pubmed.ncbi.nlm.nih.gov/37079352/
- ACT smoking app RCT (JAMA Int Med, 2020): https://pubmed.ncbi.nlm.nih.gov/32804118/
- White/pink noise ADHD meta-analysis (2024): https://pubmed.ncbi.nlm.nih.gov/38428577/
- White noise ADHD controlled trial (2007): https://pubmed.ncbi.nlm.nih.gov/17683456/
- White noise in neurotypical young adults (2022): https://pubmed.ncbi.nlm.nih.gov/36028546/
- Logged streak effects (accepted manuscript, JCR): https://udspace.udel.edu/server/api/core/bitstreams/7e3e3b64-8bf2-4527-ac93-94a160358165/content
- OpenAI Prompt Engineering guide: https://platform.openai.com/docs/guides/prompt-engineering
- GPT-5 prompting guide (cookbook): https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide
- OpenAI Safety best practices: https://platform.openai.com/docs/guides/safety-best-practices
- OpenAI Prompt optimizer: https://platform.openai.com/docs/guides/prompt-optimizer

# Gard - Goethe-Zertifikat A1 Readiness Diagnostic

> A calibrated, diagnostic web application engineered to help Indian professionals verify their Goethe-Zertifikat A1 readiness before risking their time and the ₹10,000 official exam fee.

---

## 1. Project Overview & The Problem

### Product Vision
**Gard** helps Indian professionals navigate career and life transitions to Germany. A mandatory early milestone for visa pathways and family reunification is passing the **Goethe-Zertifikat A1 (Start Deutsch 1)** examination.

### The Problem
Candidates frequently book their official Goethe-Institut exam slot prematurely based on unstructured self-study or casual app streaks. Failing the exam carries a steep penalty:
- **Financial Loss:** Each attempt costs approximately **₹10,000** in exam fees.
- **Timeline Delay:** Re-booking exam slots in high-demand Indian test centers can set migration timelines back by weeks or months.

### The Solution
A calm, gamified **readiness diagnostic** that evaluates a learner across **15 randomized questions** (5 Vocabulary, 5 Grammar, 5 Reading) with immediate, single-attempt feedback and zero retries. Rather than giving an uncalibrated raw score, the application outputs a clear **Readiness Verdict** (**Green**, **Yellow**, or **Red**) paired with a bottleneck-aware study recommendation—helping learners decide whether to book immediately or reinforce a weak foundation first.

---

## 2. Data Engineering & Official Sourcing

The diagnostic is powered by a custom **45-question JSON dataset** (`resources/45-questions-bank-2_bb0ff086.json` - 15 Vocabulary, 15 Grammar, and 15 Reading items) engineered strictly to official Goethe-Institut A1 specifications.

### Official Grounding Sources
Reviewers can find the official Goethe-Institut reference PDFs in [`public/official_references/`](./public/official_references/):
- `Goethe-Institut-A1-sample-paper-01.pdf` (*Modellsatz* — official A1 sample examination paper)
- `Pruefungsziele_Testbeschreibung_A1_SD1.pdf` (*Prüfungsziele & Testbeschreibung* — official A1 curriculum and exam specification)

### How Official Constraints Shaped the Dataset
Every question and distractor was intentionally constrained so the diagnostic neither under-tests nor unfairly leaks A2/B1 concepts:

- **Vocabulary (15 items):** Grounded strictly in the official A1 Wortliste. Both target answers and distractors stay strictly within everyday A1 lexical domains—time expressions (Samstag), urban navigation (Bahnhof), food (Milch), and basic survival terms. To mirror the heavy visual context used in the real exam's Hören and Sprechen modules, 7 of these questions utilize explicit image prompts (e.g., train stations, pharmacies, food).
- **Grammar (15 items):** Targets high-frequency A1 morphosyntax defined in the *Prüfungsziele*:
  - *Verbzweitstellung* (V2 word order in main clauses after fronted adverbials)
  - Present-tense regular/irregular conjugation (*sein*, *haben*, *sprechen*, modal *müssen*)
  - Separable prefix verbs (*einkaufen*) and formal imperatives (*Sie*)
  - Nominative, accusative (*einen*), and basic dative prepositions (*mit dem*, *um*)
  - Explicitly **excludes** A2+ structures such as *Präteritum* narration or subordinate *weil/dass* clauses.
- **Reading (15 items):** Mirrors real *Modellsatz* comprehension formats—clinic opening hours, Deutsche Bahn delay announcements, short SMS invitations, supermarket flyers, apartment notices, and prohibition signs—testing practical inference under time pressure.

---

## 3. Diagnostic Methodology: The "Exam Impact"

A 5-minute web diagnostic cannot reliably grade open-ended spoken interviews or handwritten essays without introducing AI grading latency or microphone friction. Instead, Gard tests **Vocabulary**, **Grammar**, and **Reading** as high-signal **predictive proxies** for all four modules of the official Goethe-Institut A1 exam:

| Diagnostic Pillar | Predictive Exam Proxy | Exam Impact Rationale |
| :--- | :--- | :--- |
| **Vocabulary** | **Hören (Listening)** & **Lesen (Reading)** | Without instant recognition of A1 core nouns, times, and places, learners lose comprehension during single-playback audio announcements and real-world signage tasks. |
| **Grammar** | **Schreiben (Writing)** & **Sprechen (Speaking)** | Productive modules penalize broken verb conjugation, wrong article gender, and missing V2 word order. Structural accuracy in grammar directly predicts passing marks in form-filling, short emails, and spoken requests. |
| **Reading** | **Mixed-Skill Comprehension** | Synthesizes vocabulary, negation (*kein/nicht*), and syntactic cues under time pressure—mirroring the cognitive load of the actual *Lesen* paper. |

Whenever a weakness is flagged, the Results Dashboard surfaces the corresponding **Exam Impact** warning so learners understand *why* that score threatens their ₹10,000 exam attempt.

### Isolating the Variable (Construct Validity)
A common flaw in language diagnostics is contaminated data e.g., a learner fails a Grammar question not because they don't know the grammar rule, but because they couldn't read the vocabulary in the prompt.
To ensure strict data purity, the UI pairs the German prompt with an English hint. This acts as a set of training wheels that isolates the variable being tested, ensuring that a low Grammar score genuinely reflects a syntax deficit, rather than a hidden vocabulary bottleneck.


---

## 4. Scoring Algorithm & The 2-Round Verification Loop

### The Anti-Fluke Verification
A single 15-question quiz (5 items per category) is fast enough to prevent drop-off, but small sample sizes carry statistical noise, a learner can get lucky on 1–2 multiple-choice guesses and falsely clear an 80% threshold.

To eliminate false positives, the Round 1 Results Dashboard presents a **"Verify My Score (Round 2)"** hook:
- Clicking it launches a second 15-question round sampled from the **remaining unused pool** in the 45-question dataset (`0%` question overlap with Round 1, with randomized option order in every round).

### The 30-Point Aggregation
When Round 2 is submitted, the application **does not average two separate percentages**. Instead, `calculateAggregatedQuizResult` aggregates all responses from Round 1 and Round 2 into a **30-question master evaluation** (**10 Vocabulary**, **10 Grammar**, **10 Reading**):

- **Statistical Confidence:** Evaluating 10 items per skill area (30 total) tightens the confidence interval and distinguishes genuine readiness from lucky Round 1 guesses.
- **Unified Bottleneck Detection:** A learner who scores `14/15` in Round 1 and `10/15` in Round 2 finishes at `24/30`, exposing category instability that a single round could mask.

```ts
// Core Aggregated Readiness Rules (src/utils/quizLogic.ts)
const hasCriticalBottleneck = categoryScores.some((c) => c.score <= 5);
const allSubscoresPass = categoryScores.every((c) => c.score >= 6);

if (totalScore >= 24 && allSubscoresPass) return 'True Ready'; // Green
if (totalScore <= 17) return 'Not Ready';                      // Red
// Covers 18–23/30 OR 24+/30 with any sub-score <= 5/10
return 'Borderline';                                           // Yellow
```

### Readiness Thresholds (30-Point Master Report)

| Verdict State | Combined Criteria | Diagnostic Guidance |
| :--- | :--- | :--- |
| 🟢 **True Ready** (`Exam Ready`) | **24+ / 30 (80%+)** overall **AND** **6+ / 10 (60%+)** in every sub-category | Consistent command across all modules; ready to book the exam with confidence. |
| 🟡 **Borderline** | **18–23 / 30 (60%–79%)** **OR** **24+ / 30** with any sub-score **≤ 5 / 10** | Hovering near the pass mark or carrying a single-module bottleneck; booking now is risky. |
| 🔴 **Not Ready** (`Keep Practicing`) | **≤ 17 / 30 (< 60%)** | Booking right now risks the ₹10,000 fee; reinforce core foundations first. |

*(Round 1 uses proportional 15-point / 5-per-module thresholds before unlocking the Round 2 verification check.)*

---

## 5. Actionable Feedback & Pedagogical Tie-Breakers

### Preventing Cognitive Overload
Anxious exam candidates rarely act on a wall of 10–15 separate error logs. To respect learner attention and fulfill the requirement of giving **2–3 concrete things to practice**, the **Practice Focus** section intentionally surfaces **only one card** for the user's **single weakest category** paired with:
1. Its **Exam Impact** warning callout.
2. Exactly **3 targeted, high-leverage practice tips** tailored to that skill area.

### The Tie-Breaker Logic (`Vocabulary > Grammar > Reading`)
If two or more categories tie for the lowest score (for example, `2/5` in Vocabulary and `2/5` in Grammar, or `4/10` in both on the combined report), the scoring engine resolves the tie deterministically using a strict pedagogical hierarchy:

$$\text{Vocabulary} > \text{Grammar} > \text{Reading}$$

- **Pedagogical Rationale:** Vocabulary is the atomic building block of language acquisition. A learner cannot meaningfully drill *Grammar* rules (case endings, gender agreement, V2 placement) if they do not recognize the nouns and verbs inside the sentence, nor can they decode *Reading* texts without lexical comprehension.
- **Transparent UX:** Whenever a tie-breaker activates, the Practice Focus card surfaces an italicized contextual note explaining the prioritization:
  > *"You have a few areas to work on, but [Category Name] is your most critical foundation right now. Fix this first."*

---

## 6. Tech Stack & Local Setup

### Tech Stack
- **Frontend:** React 19, TypeScript
- **Styling & Motion:** Tailwind CSS v4, custom CSS compositor animations (`prefers-reduced-motion` compliant), Poppins typography
- **Icons:** Lucide React (`lucide-react`)
- **Build & Tooling:** Vite, `tsx` + Node's native `node:test` runner for deterministic logic verification

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (http://localhost:3000)
npm run dev

# 3. Run unit tests for sampling, scoring, aggregation, and tie-breakers
npx tsx --test src/utils/quizLogic.test.ts

# 4. Type-check and create a production build
npm run lint
npm run build
```

# Omega Health: cycle-window prototype

## Demo narration

“For someone who selects irregular cycles, Omega Health shows an estimated date window instead of promising a single day. It starts with the person’s recorded period intervals and shows how much history is available. It also checks for repeated timing patterns in their symptoms, mood, nutrition check-ins, activity, and energy logs. When a recent log matches a pattern seen before at least three recorded periods, the prototype can cautiously widen the window. With limited data, it tells the user that the estimate is provisional. This is an experimental planning tool, not a medically validated prediction.”

## What the code actually does

- Uses the latest nine valid, distinct, non-future start dates, giving up to eight observed intervals. Uses date-only UTC arithmetic so daylight-saving changes do not change interval lengths.
- Fewer than two starts: shows “More history needed”; does not infer dates from symptoms alone.
- Uses the median interval as the center. Irregular or unsure profiles with fewer than three intervals get a baseline of ±7 days. With at least three intervals, the baseline radius is at least four days and grows with observed variability. The range also includes the shortest and longest observed intervals. Highly variable histories can therefore produce more than two weeks; there is no hard two-week cap.
- Looks at logs from the last three calendar days, in the current cycle. For each matching signal, it checks the preceding 14 days before each historical start. Only the last matching observation in each completed cycle counts.
- Requires a match in at least three completed cycles and no more than seven days of variation in those historical lead times. Identical normalized symptom text is matched; there is no natural-language symptom interpretation. Mood, nutrition, activity, and energy match by category/value.
- Uses the median historical lead time to derive an experimental candidate date. Combines candidates by median; limits the adjustment to three days. Expands the history window in that direction rather than narrowing or replacing it.
- These thresholds are design choices for this prototype, not clinically validated rules, confidence intervals, or proof that a lifestyle factor causes a period.
- Updates when saved data or the cycle-type selection changes. Nutrition check-ins are stored alongside the selected day’s mood and flow, using existing local storage and export flows.
- If the window passes, it preserves the prior dates and asks for missing records. It never assumes an unlogged period happened.
- All estimation runs locally. It does not use Epsilon, an AI API, or paid credits.

## Current demo data

The existing starts are September 21 and October 20, 2026: one observed 29-day interval. The initial irregular-cycle window is November 11–25, 2026. There is insufficient repeated log history to adjust it. The dashboard says that explicitly; do not claim that nutrition or symptoms already personalized this example.

## Synthetic example used in checks

Starts on June 1, July 1, August 1, and September 1 yield intervals of 30, 31, and 31 days and a September 28–October 6 baseline window. Identical “Bloating” entries on June 27, July 28, and August 28 precede the next starts by four days each. A September 25 entry matches that pattern; the candidate is September 29, three days earlier than the baseline center. The prototype expands the lower boundary to September 25 while retaining October 6. This example is synthetic test data, not a claim of medical accuracy, and was not inserted into the user’s saved records.

## Limitations and research context

Missing periods can look like long intervals; common daily habits can generate coincidental matches; the current algorithm does not measure predictive accuracy, specificity, or causation. It needs prospective evaluation against held-out future period dates before making accuracy claims. Cycle tracking and symptom diaries can help people describe patterns to a clinician, but that does not validate this particular algorithm.

Reference: https://womenshealth.gov/menstrual-cycle/your-menstrual-cycle

## Problem Statement

Ghanaian students preparing for the BECE (end of Junior High) and WASSCE (end of Senior High) have no affordable, phone-native way to practise real exam-style questions and see where they are weak. Printed Past Question books cost money, cannot be carried everywhere, and give no feedback. Existing apps are heavy, depend on connectivity, and bury students in content instead of drilling them. Students cannot easily tell which Topics they keep losing marks in, and parents have no low-cost way to help them prepare.

## Solution

A lightweight, offline-capable web app (installable PWA) where a student picks their Exam Toggle (BECE or WASSCE), picks a subject, and works through a Practice Set of ten multiple-choice questions with instant per-question feedback, then reviews what they missed and retries it. Progress is shown as a streak and per-subject accuracy. A student can start in Anonymous Mode with progress kept on-device, and signs in with a phone number only when they exhaust their Free Allowance or want to keep their progress.

## User Stories

### Getting started

1. As a JHS student, I want to choose the BECE track, so that I practise questions at my level.
2. As an SHS student, I want to choose the WASSCE track, so that I practise questions at my level.
3. As a student, I want to switch tracks with an Exam Toggle, so that I can help a sibling or check a different level.
4. As a student, I want to start practising without creating an account, so that I can try the app immediately.
5. As a student on a slow connection, I want the app to load quickly, so that I do not give up before practising.
6. As a student, I want to install the app to my home screen, so that I can open it like a normal app.

### Choosing what to practise

7. As a student, I want to see the subjects for my track, so that I can pick one.
8. As a student, I want to practise Mathematics, so that I improve my weakest core subject.
9. As a student, I want to practise Integrated Science, so that I improve my weakest core subject.
10. As a student, I want to practise English, so that I improve my weakest core subject.
11. As a student, I want to filter questions by Topic, so that I drill the exact thing I am failing.
12. As a student, I want to practise a random mix within a subject, so that I get broad coverage.

### Doing a Practice Set

13. As a student, I want a Practice Set of ten questions, so that a session fits into a short break.
14. As a student, I want one multiple-choice question at a time, so that I am not overwhelmed.
15. As a student, I want instant feedback after each answer, so that I learn immediately.
16. As a student, I want to see whether my answer was correct, so that I know where I stand.
17. As a student, I want to see the correct answer highlighted, so that I learn the right one.
18. As a student, I want a one-line Explanation of why the answer is correct, so that I understand the concept.
19. As a student, I want the Explanation to link to the Lesson for that Topic, so that I can study it later.
20. As a student, I want to move to the next question without waiting, so that I keep my rhythm.
21. As a student, I want to practise without a timer by default, so that I can think without pressure.
22. As a student, I want an Exam Mode timer toggle, so that I can practise under real exam pressure.
23. As a student, I want to abandon a set and start a new one, so that I am not stuck.

### Finishing a set

24. As a student, I want to see my score at the end of a set, so that I know how I did.
25. As a student, I want to review the questions I missed, so that I can learn from mistakes.
26. As a student, I want a "Retry missed" action, so that I can drill exactly what I got wrong.
27. As a student, I want a "Next set" action, so that I can keep going.
28. As a student, I want my results saved without an account, so that I do not lose progress.

### Tracking progress

29. As a student, I want to see my practice streak, so that I stay motivated.
30. As a student, I want to see per-subject accuracy, so that I know which subject needs work.
31. As a student, I want my progress kept on my device while anonymous, so that I can see it without signing in.
32. As a student, I want my progress kept when I sign in, so that I do not lose it at the wall.

### Signing in and free allowance

33. As a student, I want ten questions free per subject, so that I can sample everything before deciding.
34. As a student, I want a clear Sign-in Wall when I exhaust my Free Allowance, so that I know what to do next.
35. As a student, I want to sign in with my phone number and a one-time code, so that I do not need an email.
36. As a student, I want my anonymous progress merged into my account on first sign-in, so that nothing is lost.
37. As a student, I want to sign out, so that I can hand my phone to a friend.
38. As a student, I want my free allowance tracked per subject, so that exhausting Maths does not lock me out of Science.

### Free tier, ads, and paid tier

39. As a free student, I want to unlock an extra practice set by watching a short rewarded ad, so that I can keep practising without paying.
40. As a free student, I want rewarded ads to appear only when I am online, so that offline practice is never interrupted.
41. As a paying student, I want full Lessons, unlimited practice, analytics, and offline download of the full bank, so that my subscription is worth it.
42. As a paying student, I want to pay by mobile money, so that I do not need a card.
43. As a paying student, I want a monthly or term price, so that I can pay in the way that suits my family.

### Offline and data

44. As a student with no data, I want to practise offline, so that connectivity never blocks me.
45. As a student, I want the question bank cached on my device, so that sets load instantly.
46. As a student on a low-end phone, I want the app to stay small and fast, so that it works on my device.
47. As a student, I want my offline progress to sync when I am back online, so that my streak survives.

### Sharing and growth

48. As a student, I want to share the app by a link, so that I can invite classmates.
49. As a student, I want to share my streak or score, so that I can encourage friends.

## Implementation Decisions

### Platform and stack

- Offline-capable PWA built with Next.js and React, targeting Android and mobile web. No native iOS app (ADR-0002).
- Supabase (Postgres) for server data; Vercel for hosting.
- IndexedDB on-device for the cached question bank and anonymous progress.

### Domain model

- **Exam** — BECE or WASSCE. Drives the Exam Toggle and subject availability.
- **Subject** — Mathematics, Integrated Science, English (v1), scoped to an Exam.
- **Topic** — a subject subdivision (e.g. Mathematics → Fractions, Addition, Factorization), mapped to the official GES/NaCCA strand and sub-strand taxonomy.
- **Question** — a multiple-choice item: exam, subject, topic, question text, four options, one correct option, and a one-line Explanation.
- **Practice Set** — ten Questions assembled for a session.
- **Attempt** — a student's answers to one Practice Set, with score and per-question outcomes.
- **Progress** — streak and per-subject accuracy for a student.
- **Student** — identified by phone number once signed in; otherwise anonymous and device-local.

### Question bank and content ingestion

- Content enters through the OCR-and-review pipeline (ADR-0005): vision extraction of scanned PDF pages into draft rows, human review, and only approved rows ship.
- v1 target: roughly 50 approved Questions per subject-track, six subject-tracks, about 300 Questions total, grouped by Topic.
- Content provenance follows ADR-0001 (past questions with number variation and light rewording).

### Practice loop

- A Practice Set is ten Questions selected at random within the chosen Subject, optionally filtered by Topic.
- Feedback is per-question and immediate: correct/incorrect, correct answer highlighted, and the Explanation shown.
- Untimed by default, with an optional Exam Mode timer.
- End of set shows the score, a review of missed Questions, and offers "Retry missed" and "Next set".

### Identity and access

- Anonymous Mode keeps progress in IndexedDB with no account.
- Free Allowance is ten answered Questions per Subject; on exhaustion, the Sign-in Wall appears.
- Sign-in is phone number plus one-time code (ADR-0004).
- On first sign-in, anonymous progress merges into the account (best-per-subject wins).

### Monetization

- Free Tier is ad-supported with rewarded ads shown only when online (ADR-0003).
- Paid Tier unlocks Lessons, unlimited practice, analytics, and offline bank download, priced monthly or as a Term Pass, paid by mobile money via Paystack.
- Payments and ads are not built in v1; the data model and screens should not preclude them.

### Test seams

- The practice loop's decision logic (set assembly, scoring, free-allowance accounting, progress merge) sits behind a single domain seam that the UI calls, so it can be tested without a browser or network.
- The content ingestion pipeline exposes a seam that turns a page of scanned input into draft Question rows and validates them before acceptance.

## Testing Decisions

- Good tests exercise external behaviour only: given a bank and a student's state, what Questions come back, what the score is, what the Free Allowance becomes, and how progress merges. They must not assert on internal data structures or storage internals.
- Modules to test: set assembly (random within subject, topic filter, set size, no repeats within a set), scoring and review (correct/incorrect per Question, missed list, retry-missed set), Free Allowance accounting (per subject, decrement, wall trigger), progress merge on sign-in (best-per-subject wins, no loss), and the ingestion validator (rejects malformed rows, requires one correct option).
- Prior art: none — this is a greenfield repo, so these are the first tests. Establish the domain seam as the primary test surface and keep it the highest seam available.

## Out of Scope

- Lessons content and the lesson-reading experience.
- A full analytics dashboard (v1 ships only streak and per-subject accuracy).
- Payment integration (Paystack) and ad integration.
- Native iOS and native Android apps.
- Theory/essay question types and human marking.
- Adaptive difficulty or weak-topic weighting.
- School, teacher, or B2B tooling.
- Social features beyond a share link.

## Further Notes

- The content legal posture is a deliberate, recorded trade-off (ADR-0001); it is a known risk, not an oversight.
- The SHS/WASSCE topic taxonomy must be confirmed against the exam-board version before locking SHS Topic tags, because NaCCA's 2023 SHS curriculum and WAEC's exam syllabus can diverge.
- SyllabusGH is the incumbent to beat on experience, not content volume.
- The OCR-and-review pipeline is the content bottleneck; bank size grows at review speed, not scrape speed.

# Theme follows the Exam Toggle

One app serves two tracks, and each track gets its own visual mode: BECE (JHS) is light, WASSCE (SHS) is dark. The theme is not a user setting. Selecting a track sets it, in both directions, and the choice persists with the track.

The alternative was an explicit appearance control (a sun/moon toggle) that the student sets once and keeps regardless of track. We chose to bind theme to track because it needs no new control, costs no taps, and turns the visual change into a free signal that the student has switched exam level. It also fits the product story: JHS reads as daylight, SHS as the night before the exam.

**Status**: accepted

## Considered Options

- **Theme follows the Exam Toggle (chosen).** No extra control; the mode is a side effect of a choice the student already makes.
- **Separate appearance setting.** More explicit control, but adds a control, more taps, and a persisted preference to reconcile with the track.
- **System `prefers-color-scheme` only.** Respects the device, but breaks the deliberate JHS/SHS distinction and can contradict the chosen track.

## Consequences

- The two palettes are a product surface, not a preference: both must be designed and kept in step. A new component must be checked in light and dark.
- The theme hook is a single `data-track` attribute on `<html>`, so styling stays in CSS and no component carries theme logic.
- The student cannot choose light while practising SHS. If that becomes a real need, this decision reopens.
- Theme is per-device, like the rest of Anonymous Mode, and follows the stored track on load.

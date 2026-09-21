// Progress merge seam.
// On first sign-in a student's anonymous on-device Progress merges into their
// account. Best-per-subject wins and nothing gets worse, so the rule is pure
// and testable without a browser, network, or storage.

import { SubjectId } from "./subject";
import { Progress, SubjectAccuracy, accuracyPercent } from "./progress";

/** The stronger of two subject totals: higher accuracy, then more answers. */
function better(a: SubjectAccuracy, b: SubjectAccuracy): SubjectAccuracy {
  const pa = accuracyPercent(a) ?? -1;
  const pb = accuracyPercent(b) ?? -1;
  if (pa !== pb) return pa > pb ? a : b;
  if (a.total !== b.total) return a.total > b.total ? a : b;
  if (a.correct !== b.correct) return a.correct > b.correct ? a : b;
  return a;
}

function laterDay(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a >= b ? a : b;
}

/**
 * Merge anonymous Progress into account Progress. For every subject the
 * stronger result is kept, the longer streak survives, and the most recent
 * practice day wins, so no progress is lost at the wall.
 */
export function mergeProgress(local: Progress, remote: Progress): Progress {
  const accuracy: Partial<Record<SubjectId, SubjectAccuracy>> = {};
  const subjects = new Set<SubjectId>([
    ...(Object.keys(local.accuracy) as SubjectId[]),
    ...(Object.keys(remote.accuracy) as SubjectId[]),
  ]);
  for (const subject of subjects) {
    const a = local.accuracy[subject];
    const b = remote.accuracy[subject];
    if (a && b) accuracy[subject] = better(a, b);
    else accuracy[subject] = (a ?? b) as SubjectAccuracy;
  }
  return {
    streak: Math.max(local.streak, remote.streak),
    lastDay: laterDay(local.lastDay, remote.lastDay),
    accuracy,
  };
}

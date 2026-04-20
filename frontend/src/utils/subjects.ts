import type { Subject, SubjectKey } from "../types";

export const SUBJECTS: Record<SubjectKey, Subject> = {
  mat: { key: "mat", name: "Matematyka", color: "var(--color-sub-mat)" },
  bio: { key: "bio", name: "Biologia", color: "var(--color-sub-bio)" },
  hist: { key: "hist", name: "Historia", color: "var(--color-sub-hist)" },
  pol: { key: "pol", name: "Polski", color: "var(--color-sub-pol)" },
  chem: { key: "chem", name: "Chemia", color: "var(--color-sub-chem)" },
  fiz: { key: "fiz", name: "Fizyka", color: "var(--color-sub-fiz)" },
  ang: { key: "ang", name: "Angielski", color: "var(--color-sub-ang)" },
};

export function subjectName(key: SubjectKey): string {
  return SUBJECTS[key].name;
}

export function subjectColor(key: SubjectKey): string {
  return SUBJECTS[key].color;
}

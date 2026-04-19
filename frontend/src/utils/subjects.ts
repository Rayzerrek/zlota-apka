import type { Subject, SubjectKey } from "../types/types";

export const SUBJECTS: Record<SubjectKey, Subject> = {
  mat: { key: "mat", name: "Matematyka", color: "var(--sub-mat)" },
  bio: { key: "bio", name: "Biologia", color: "var(--sub-bio)" },
  hist: { key: "hist", name: "Historia", color: "var(--sub-hist)" },
  pol: { key: "pol", name: "Polski", color: "var(--sub-pol)" },
  chem: { key: "chem", name: "Chemia", color: "var(--sub-chem)" },
  fiz: { key: "fiz", name: "Fizyka", color: "var(--sub-fiz)" },
  ang: { key: "ang", name: "Angielski", color: "var(--sub-ang)" },
};

export function subjectName(key: SubjectKey): string {
  return SUBJECTS[key].name;
}

export function subjectColor(key: SubjectKey): string {
  return SUBJECTS[key].color;
}

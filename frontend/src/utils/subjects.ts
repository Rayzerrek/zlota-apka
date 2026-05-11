import type { Subject, SubjectKey } from "../types";

export const SUBJECTS: Record<SubjectKey, Subject> = {
  mat: { key: "mat", name: "Matematyka", color: "var(--color-sub-mat)" },
  bio: { key: "bio", name: "Biologia", color: "var(--color-sub-bio)" },
  hist: { key: "hist", name: "Historia", color: "var(--color-sub-hist)" },
  pol: { key: "pol", name: "Polski", color: "var(--color-sub-pol)" },
  chem: { key: "chem", name: "Chemia", color: "var(--color-sub-chem)" },
  fiz: { key: "fiz", name: "Fizyka", color: "var(--color-sub-fiz)" },
  ang: { key: "ang", name: "Angielski", color: "var(--color-sub-ang)" },
  other: { key: "other", name: "Inne", color: "var(--color-ink-faint)" },
};

export const SUBJECT_BG: Record<SubjectKey, string> = {
  mat: "bg-sub-mat",
  bio: "bg-sub-bio",
  hist: "bg-sub-hist",
  pol: "bg-sub-pol",
  chem: "bg-sub-chem",
  fiz: "bg-sub-fiz",
  ang: "bg-sub-ang",
  other: "bg-rule-strong",
};

export const SUBJECT_TEXT: Record<SubjectKey, string> = {
  mat: "text-sub-mat",
  bio: "text-sub-bio",
  hist: "text-sub-hist",
  pol: "text-sub-pol",
  chem: "text-sub-chem",
  fiz: "text-sub-fiz",
  ang: "text-sub-ang",
  other: "text-ink-muted",
};

export function subjectName(key: SubjectKey): string {
  return SUBJECTS[key].name;
}

export function subjectColor(key: SubjectKey): string {
  return SUBJECTS[key].color;
}

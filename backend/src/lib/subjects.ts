export const SUBJECT_KEYS = [
  "mat",
  "bio",
  "hist",
  "pol",
  "chem",
  "fiz",
  "ang",
  "other",
] as const;

export type SubjectKey = (typeof SUBJECT_KEYS)[number];

const SUBJECT_ALIASES: Record<string, SubjectKey> = {
  mat: "mat",
  math: "mat",
  matematyka: "mat",
  bio: "bio",
  biology: "bio",
  biologia: "bio",
  hist: "hist",
  history: "hist",
  historia: "hist",
  pol: "pol",
  polish: "pol",
  polski: "pol",
  chem: "chem",
  chemistry: "chem",
  chemia: "chem",
  fiz: "fiz",
  physics: "fiz",
  fizyka: "fiz",
  ang: "ang",
  english: "ang",
  angielski: "ang",
  other: "other",
  inne: "other",
  unknown: "other",
};

export function normalizeSubjectKey(rawKey: string): SubjectKey | null {
  const normalizedKey = rawKey.trim().toLowerCase();
  return SUBJECT_ALIASES[normalizedKey] ?? null;
}

import { subjectName } from "./subjects";

import type { Card, Exam } from "../types";

export type NoteSection = {
  topic: string;
  pairs: { q: string; a: string }[];
};

export type ExamNote = {
  examName: string;
  subject: string;
  dateISO: string;
  sections: NoteSection[];
  cardCount: number;
};

export function generateExamNote(exam: Exam, cards: Card[]): ExamNote {
  const relevant = cards.filter((c) => c.subject === exam.subject);
  const byTopic = new Map<string, { q: string; a: string }[]>();
  for (const card of relevant) {
    const pairs = byTopic.get(card.topic) ?? [];
    pairs.push({ q: card.question, a: card.answer });
    byTopic.set(card.topic, pairs);
  }
  return {
    examName: exam.name,
    subject: subjectName(exam.subject),
    dateISO: exam.dateISO,
    sections: [...byTopic.entries()].map(([topic, pairs]) => ({
      topic,
      pairs,
    })),
    cardCount: relevant.length,
  };
}

export function noteToMarkdown(note: ExamNote): string {
  const lines: string[] = [
    `# ${note.examName}`,
    `**Przedmiot:** ${note.subject} · **Termin:** ${note.dateISO}`,
    "",
  ];
  for (const section of note.sections) {
    lines.push(`## ${section.topic}`);
    for (const { q, a } of section.pairs) {
      lines.push(`- **P:** ${q}`);
      lines.push(`  **O:** ${a}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export type Rating = 1 | 2 | 3 | 4;

export enum CardState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export interface CardSchedule {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: CardState;
  lastReview: Date;
  due: Date;
}

export function scheduleReview(
  card: {
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: CardState;
    lastReview: Date | null;
  },
  rating: Rating,
  now: Date,
): CardSchedule {
  const elapsed = card.lastReview
    ? Math.floor((now.getTime() - card.lastReview.getTime()) / 86_400_000)
    : 0;

  let { stability, difficulty, reps, lapses } = card;
  let scheduledDays: number;
  let nextState: CardState;

  if (card.state === CardState.New) {
    if (rating === 1) {
      stability = 0.5;
      difficulty = Math.min(10, difficulty + 1);
      scheduledDays = 0;
      nextState = CardState.Learning;
    } else if (rating === 2) {
      stability = 1;
      difficulty = Math.min(10, difficulty + 0.5);
      scheduledDays = 1;
      nextState = CardState.Learning;
    } else if (rating === 3) {
      stability = 1.5;
      scheduledDays = 1;
      nextState = CardState.Review;
    } else {
      stability = 3;
      difficulty = Math.max(1, difficulty - 1);
      scheduledDays = 4;
      nextState = CardState.Review;
    }
    reps = 1;
  } else if (card.state === CardState.Review) {
    reps += 1;
    if (rating === 1) {
      lapses += 1;
      stability = Math.max(0.5, stability * 0.2);
      difficulty = Math.min(10, difficulty + 1.5);
      scheduledDays = 1;
      nextState = CardState.Relearning;
    } else {
      const factor = rating === 2 ? 1.2 : rating === 3 ? 2.0 : 2.8;
      const mod = rating === 2 ? 0.9 : rating === 4 ? 1.1 : 1.0;
      scheduledDays = Math.max(1, Math.round(stability * factor));
      stability = stability * factor * mod;
      if (rating === 4) difficulty = Math.max(1, difficulty - 0.5);
      nextState = CardState.Review;
    }
  } else {
    if (rating === 1) {
      stability = Math.max(0.5, stability * 0.8);
      scheduledDays = 0;
      nextState = card.state;
    } else if (rating >= 3) {
      scheduledDays = Math.max(1, Math.round(stability));
      nextState = CardState.Review;
      reps += 1;
    } else {
      scheduledDays = 1;
      nextState = card.state;
      reps += 1;
    }
  }

  const due = new Date(now);
  if (scheduledDays === 0) {
    due.setMinutes(due.getMinutes() + 10);
  } else {
    due.setDate(due.getDate() + scheduledDays);
  }

  return {
    stability,
    difficulty,
    elapsedDays: elapsed,
    scheduledDays,
    reps,
    lapses,
    state: nextState,
    lastReview: now,
    due,
  };
}

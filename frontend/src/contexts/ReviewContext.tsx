import { createContext, useContext, useState } from "react";

const ReviewContext = createContext<{
  reviewSessionId: string | null;
  setReviewSessionId: (id: string | null) => void;
} | null>(null);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  return (
    <ReviewContext.Provider value={{ reviewSessionId, setReviewSessionId }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used within ReviewProvider");
  return ctx;
}

UPDATE "subjects"
SET "key" = CASE
  WHEN lower(trim("key")) IN ('mat', 'math', 'matematyka') THEN 'mat'
  WHEN lower(trim("key")) IN ('bio', 'biology', 'biologia') THEN 'bio'
  WHEN lower(trim("key")) IN ('hist', 'history', 'historia') THEN 'hist'
  WHEN lower(trim("key")) IN ('pol', 'polish', 'polski') THEN 'pol'
  WHEN lower(trim("key")) IN ('chem', 'chemistry', 'chemia') THEN 'chem'
  WHEN lower(trim("key")) IN ('fiz', 'physics', 'fizyka') THEN 'fiz'
  WHEN lower(trim("key")) IN ('ang', 'english', 'angielski') THEN 'ang'
  ELSE 'other'
END;
--> statement-breakpoint
ALTER TABLE "subjects"
ADD CONSTRAINT "subjects_key_allowed_check"
CHECK ("key" IN ('mat', 'bio', 'hist', 'pol', 'chem', 'fiz', 'ang', 'other'));

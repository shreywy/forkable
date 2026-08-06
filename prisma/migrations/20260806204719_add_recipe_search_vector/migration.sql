-- Weighted full-text search vector over recipe name (A), description (B), story (C).
-- Generated column keeps it in sync automatically; GIN index makes it fast.
ALTER TABLE "Recipe" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("story", '')), 'C')
  ) STORED;

CREATE INDEX "Recipe_searchVector_idx" ON "Recipe" USING GIN ("searchVector");

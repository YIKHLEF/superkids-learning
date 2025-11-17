-- Add analytics fields to activity_sessions
ALTER TABLE "activity_sessions"
ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dominantEmotion" TEXT;

-- Add why_choose JSON column to services table (safe, idempotent)
-- This stores an array of 3 objects: [{ title, text }, { title, text }, { title, text }]
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'why_choose'
  ) THEN
    ALTER TABLE services ADD COLUMN why_choose JSON NULL;
  END IF;

  -- Also add missing columns that may not exist on older installs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'short_title'
  ) THEN
    ALTER TABLE services ADD COLUMN short_title VARCHAR(200) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'tagline'
  ) THEN
    ALTER TABLE services ADD COLUMN tagline TEXT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'what_is'
  ) THEN
    ALTER TABLE services ADD COLUMN what_is TEXT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'where_used'
  ) THEN
    ALTER TABLE services ADD COLUMN where_used TEXT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'image_alt'
  ) THEN
    ALTER TABLE services ADD COLUMN image_alt VARCHAR(255) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'benefits'
  ) THEN
    ALTER TABLE services ADD COLUMN benefits JSON NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'process'
  ) THEN
    ALTER TABLE services ADD COLUMN process JSON NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE services ADD COLUMN title_ar VARCHAR(200) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE services ADD COLUMN description_ar TEXT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'long_description_ar'
  ) THEN
    ALTER TABLE services ADD COLUMN long_description_ar TEXT NULL;
  END IF;
END $$;
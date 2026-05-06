ALTER TABLE profile ADD COLUMN experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profile ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
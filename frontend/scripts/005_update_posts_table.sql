-- posts 테이블에 episodes 등 새로운 컬럼들 추가하기
ALTER TABLE posts ADD COLUMN IF NOT EXISTS episodes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

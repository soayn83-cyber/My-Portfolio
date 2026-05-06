-- posts 테이블에 웹툰 키워드를 저장할 수 있는 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS keywords TEXT;

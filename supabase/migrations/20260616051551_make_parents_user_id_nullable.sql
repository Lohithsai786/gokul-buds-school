-- Make user_id nullable so parent records can be created without an auth account
ALTER TABLE parents ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE "contributions"
  ADD COLUMN "receipt_data" BYTEA,
  ADD COLUMN "receipt_mime" TEXT,
  ADD COLUMN "receipt_file_name" TEXT;

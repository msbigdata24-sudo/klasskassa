ALTER TABLE "contributions"
  ADD COLUMN "receipt_stored" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "receipt_deleted_at" TIMESTAMP(3);

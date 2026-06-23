-- Purchased match freeze credits
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS freeze_balance INT NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD CONSTRAINT users_freeze_balance_nonneg_chk CHECK (freeze_balance >= 0);

COMMIT;

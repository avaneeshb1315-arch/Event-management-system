BEGIN;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

ALTER TABLE seat_locks
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

ALTER TABLE bookings
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE seat_locks
ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_auth_user
ON bookings(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_locks_auth_user
ON seat_locks(auth_user_id);

COMMIT;

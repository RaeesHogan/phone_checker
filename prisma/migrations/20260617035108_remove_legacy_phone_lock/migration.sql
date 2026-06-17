-- Remove legacy partial unique index to allow multiple active reservations per phone number
DROP INDEX IF EXISTS "Reservation_phoneNumber_active_unique";

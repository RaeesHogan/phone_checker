-- Step 1: Add columns as nullable first
ALTER TABLE "ReservationItem" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "ReservationItem" ADD COLUMN "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- Step 2: Backfill data from Reservation table
UPDATE "ReservationItem"
SET "phoneNumber" = r."phoneNumber",
    "status" = r."status"
FROM "Reservation" r
WHERE "ReservationItem"."reservationId" = r."id";

-- Step 3: Make phoneNumber required after data is backfilled
ALTER TABLE "ReservationItem" ALTER COLUMN "phoneNumber" SET NOT NULL;

-- Step 4: Add indexes
CREATE INDEX "ReservationItem_phoneNumber_idx" ON "ReservationItem"("phoneNumber");
CREATE INDEX "ReservationItem_status_idx" ON "ReservationItem"("status");

-- Step 5: Add the strict main product locking index (Purely on ReservationItem table)
-- 1 phone number can have only ONE ACTIVE reservation item with isMainProduct = true
CREATE UNIQUE INDEX "ReservationItem_strict_main_product_idx" ON "ReservationItem"("phoneNumber") 
WHERE "isMainProduct" = true AND "status" = 'ACTIVE';

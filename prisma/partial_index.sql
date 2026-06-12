CREATE UNIQUE INDEX "Reservation_phoneNumber_active_unique" ON "Reservation"("phoneNumber") WHERE status = 'ACTIVE';

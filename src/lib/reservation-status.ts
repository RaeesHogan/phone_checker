import { Prisma, Status } from "@prisma/client";

type ReservationStatusSyncResult = {
  expiredReservations: number;
  expiredItems: number;
};

/**
 * Keeps Reservation and ReservationItem statuses in sync after expiry.
 * Optional phoneNumber narrows the work to one customer's reservation flow.
 */
export async function syncExpiredReservationStatuses(
  tx: Prisma.TransactionClient,
  now: Date,
  phoneNumber?: string,
): Promise<ReservationStatusSyncResult> {
  const phoneFilter = phoneNumber ? { phoneNumber } : {};

  const expiredReservations = await tx.reservation.updateMany({
    where: {
      ...phoneFilter,
      status: Status.ACTIVE,
      expirationDate: { lte: now },
    },
    data: { status: Status.EXPIRED },
  });

  const expiredItems = await tx.reservationItem.updateMany({
    where: {
      status: Status.ACTIVE,
      reservation: {
        ...(phoneNumber ? { phoneNumber } : {}),
        status: Status.EXPIRED,
        expirationDate: { lte: now },
      },
    },
    data: { status: Status.EXPIRED },
  });

  return {
    expiredReservations: expiredReservations.count,
    expiredItems: expiredItems.count,
  };
}

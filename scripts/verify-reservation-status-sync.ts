import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const actionSource = readFileSync(
  resolve(root, "src/app/actions/reservation.ts"),
  "utf8",
);
const cronSource = readFileSync(
  resolve(root, "src/app/api/cron/expire-reservations/route.ts"),
  "utf8",
);

const mainLockQuery = actionSource.match(
  /const existingMain = await tx\.reservationItem\.findFirst\(\{([\s\S]*?)\n\s*\}\);/,
)?.[1] ?? "";

assert.match(
  mainLockQuery,
  /reservation:\s*\{[\s\S]*?expirationDate:\s*\{\s*gt:\s*now\s*\}/,
  "main-product lock must ignore items whose parent reservation is expired",
);

assert.match(
  actionSource,
  /await syncExpiredReservationStatuses\(tx, now, validatedData\.phoneNumber\)/,
  "creating a reservation must synchronously expire stale status for its phone",
);

assert.match(
  cronSource,
  /await prisma\.\$transaction\(async \(tx\) =>[\s\S]*syncExpiredReservationStatuses\(tx, now\)/,
  "cron must synchronize parent and child statuses in one transaction",
);

console.log("reservation status sync regression checks passed");

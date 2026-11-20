import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/components/features/ReservationList.tsx"),
  "utf8",
);

assert.match(
  source,
  /const getExpiryDisplay = \(date: string\)/,
  "expiry display helper must exist",
);
assert.match(
  source,
  /expiryDate <= new Date\(\)[\s\S]*label: "หมดอายุแล้ว"/,
  "a deadline already passed today must say หมดอายุแล้ว",
);
assert.match(
  source,
  /daysRemaining === 0[\s\S]*label: "หมดคืนนี้"/,
  "same-day future expiry must say หมดคืนนี้ instead of 0 วัน",
);
assert.match(
  source,
  /format\(new Date\(res\.expirationDate\), "d MMM yy · HH:mm น\."/,
  "row must show the exact expiry date and time",
);
assert.doesNotMatch(
  source,
  /<span>\{isExpired \? 'หมดอายุ' : `\$\{daysRemaining\} วัน`\}<\/span>/,
  "legacy ambiguous day-count rendering must be removed",
);

console.log("expiry status UI regression checks passed");

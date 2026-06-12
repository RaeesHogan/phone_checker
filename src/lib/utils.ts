import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize Thai phone number to 0XXXXXXXXX format
 * Example: +66812345678 -> 0812345678
 * Example: 081-234-5678 -> 0812345678
 */
export function normalizePhoneNumber(phone: string): string {
  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 66 and is 11 digits long, replace 66 with 0
  if (cleaned.startsWith("66") && cleaned.length === 11) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Ensure it's 10 digits and starts with 0
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return cleaned;
  }

  return cleaned; // Return as is if format doesn't match expected patterns (will be caught by validation)
}

/**
 * Format date to Thai locale
 */
export function formatThaiDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

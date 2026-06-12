/**
 * Normalizes Thai phone numbers to a consistent 10-digit format (0XXXXXXXXX).
 * 
 * Rules:
 * 1. Strip all non-digit characters.
 * 2. If length is 11 and starts with '66', replace '66' with '0'.
 * 3. Return the resulting string.
 * 
 * Examples:
 * 081-234-5678 -> 0812345678
 * +66812345678 -> 0812345678
 * 66812345678  -> 0812345678
 */
export function normalizePhoneNumber(phone: string): string {
  // Strip non-digits
  let digits = phone.replace(/\D/g, '');

  // Handle Thai country code (66)
  if (digits.length === 11 && digits.startsWith('66')) {
    digits = '0' + digits.slice(2);
  }

  return digits;
}

/**
 * Validates if the normalized phone number is a valid Thai mobile format.
 * (Usually starts with 06, 08, 09 and is 10 digits long)
 */
export function isValidThaiPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^0[689]\d{8}$/.test(normalized);
}

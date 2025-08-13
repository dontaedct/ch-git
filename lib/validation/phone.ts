/**
 * Phone number validation and normalization utilities
 */

/**
 * Normalizes a phone number by stripping non-digits and validating length
 * @param s - The phone number string to normalize
 * @returns Normalized phone number (digits only) or null if invalid
 * @throws Error if input is invalid (empty string, null, undefined, or invalid length)
 */
export function normalizePhone(s?: string): string | null {
  // Handle undefined/null case
  if (s === undefined || s === null) {
    throw new Error('Phone number cannot be undefined or null');
  }
  
  // Handle empty string case
  if (s === '') {
    throw new Error('Phone number cannot be empty');
  }
  
  // Strip all non-digit characters
  const digits = s.replace(/\D/g, '');
  
  // Validate length (10-15 digits)
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }
  
  return digits;
}

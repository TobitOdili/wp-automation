/**
 * Generates a unique message ID
 */
export function generateId() {
  return Math.random().toString(36).substring(7);
}
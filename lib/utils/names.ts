/**
 * Get a display-friendly short name from a full player name.
 * Handles multi-word surnames like "van Dijk", "De Bruyne", "ter Stegen", "Di Maria".
 */
const SURNAME_PREFIXES = new Set([
  'van', 'de', 'di', 'el', 'al', 'von', 'ter', 'le', 'la', 'dos', 'da', 'do', 'del',
  'Van', 'De', 'Di', 'El', 'Al', 'Von', 'Ter', 'Le', 'La', 'Dos', 'Da', 'Do', 'Del',
])

export function getShortName(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length <= 1) return fullName

  // Walk backwards from the end to find where the surname starts
  // If the second-to-last word is a surname prefix, include it
  let surnameStart = parts.length - 1
  while (surnameStart > 1 && SURNAME_PREFIXES.has(parts[surnameStart - 1])) {
    surnameStart--
  }

  // Single-word first names like "Pedri", "Rodri", "Endrick" — just return as-is
  if (surnameStart === 0) return fullName

  return parts.slice(surnameStart).join(' ')
}

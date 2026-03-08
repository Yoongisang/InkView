/**
 * Parse a page range string like "1-5, 8, 10-15" into 0-based page indices.
 * Returns null if the input is invalid or out of bounds.
 */
export function parsePageRanges(
  input: string,
  totalPages: number
): number[] | null {
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const indices = new Set<number>();

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > totalPages) {
        return null;
      }
      for (let i = start; i <= end; i++) {
        indices.add(i - 1); // convert to 0-based
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1 || page > totalPages) return null;
      indices.add(page - 1);
    }
  }

  return [...indices].sort((a, b) => a - b);
}

/**
 * Download a Uint8Array as a file in the browser.
 */
export function downloadFile(data: Uint8Array, filename: string): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function normalizeArabicForSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    // Arabic diacritics + tatweel
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640]/g, '')
    // Hamza/alef variants
    .replace(/[ٱإأآ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    // Arabic/Persian digits -> western digits
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    // Keep only letters, numbers, spaces
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

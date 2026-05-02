// Generate URL-friendly slugs from titles (supports Bengali)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// "title-slug-abc12345" — 8-char short id appended.
export function createSlug(title: string, id: string): string {
  const slug = slugify(title);
  const shortId = id.substring(0, 8);
  return slug ? `${slug}-${shortId}` : shortId;
}

const FULL_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHORT_ID = /^[0-9a-f]{8}$/i;

// Returns the trailing short id if present, otherwise the slug as-is.
export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  if (FULL_UUID.test(slug)) return slug;
  const parts = slug.split('-');
  const last = parts[parts.length - 1] || '';
  return SHORT_ID.test(last) ? last : slug;
}

export function isFullUuid(s: string): boolean {
  return FULL_UUID.test(s);
}

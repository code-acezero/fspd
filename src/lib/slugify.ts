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

// "title-slug-<full-uuid>" — full UUID appended so DB lookup works without text-cast.
export function createSlug(title: string, id: string): string {
  const slug = slugify(title);
  return slug ? `${slug}-${id}` : id;
}

const FULL_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const FULL_UUID_EXACT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHORT_ID = /^[0-9a-f]{8}$/i;

// Returns the embedded UUID from the slug. Falls back to legacy short-id or raw slug.
export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  if (FULL_UUID_EXACT.test(slug)) return slug;
  const m = slug.match(FULL_UUID);
  if (m) return m[0];
  const parts = slug.split('-');
  const last = parts[parts.length - 1] || '';
  return SHORT_ID.test(last) ? last : slug;
}

export function isFullUuid(s: string): boolean {
  return FULL_UUID.test(s);
}

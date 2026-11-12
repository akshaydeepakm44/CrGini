/**
 * Shared Showcase Utilities and In-Memory Cache
 * Decouples controllers, services, and repositories to prevent circular imports.
 */

export const cleanSlug = (input) => {
  if (!input) return '';
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const isMockDummyLead = (l) => {
  if (!l) return true;
  const email = (l.email || '').toLowerCase().trim();
  const company = (l.company || '').toLowerCase().trim();
  const name = (l.name || '').toLowerCase().trim();
  return (
    email === 's.jenkins@acmeglobal.com' ||
    (name === 'sarah jenkins' && company === 'acme global systems') ||
    (name === 'sample decision maker' && company.includes('partner'))
  );
};

export const showcaseCache = new Map();
export const CACHE_TTL_MS = 5 * 1000; // 5s short TTL

export const invalidateShowcaseCache = (slug) => {
  if (!slug) {
    showcaseCache.clear();
  } else {
    showcaseCache.delete(String(slug).toLowerCase().trim());
  }
};


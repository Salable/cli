import coreSlugify from 'slugify';

export function slugify(value: string): string {
  return coreSlugify(value, {
    lower: true,
    strict: true, // NOTE: This trims special characters such as ' and !
    replacement: '_',
  });
}

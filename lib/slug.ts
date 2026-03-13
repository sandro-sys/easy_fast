/**
 * Gera slug para URL: nome sem espaços, minúsculo, sem acentos.
 * Ex: "Feito Coqueiros" -> "feito-coqueiros"
 */
export function nameToSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "restaurante";
}

/**
 * Garante slug único: se existir no Set, acrescenta sufixo numérico.
 */
export function ensureUniqueSlug(slug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(slug)) return slug;
  let n = 1;
  while (existingSlugs.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

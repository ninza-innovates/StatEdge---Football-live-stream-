/**
 * Generate SEO-friendly slug from team names
 * Example: "Leeds United" + "Sheffield United" -> "leeds-united-vs-sheffield-united"
 */
export function generateMatchSlug(homeTeam: string, awayTeam: string): string {
  const slugify = (str: string) => 
    str.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  
  return `${slugify(homeTeam)}-vs-${slugify(awayTeam)}`;
}

/**
 * Generate meta title for match thread
 * Example: "Leeds United vs Sheffield United"
 */
export function generateMatchTitle(homeTeam: string, awayTeam: string): string {
  return `${homeTeam} vs ${awayTeam}`;
}

/**
 * URL slug for one team name.
 * Punctuation is removed and repeated hyphens are collapsed, so
 * "Brighton & Hove Albion" becomes "brighton-hove-albion".
 * Match pages resolve teams with this same function.
 */
export function slugifyTeamName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate SEO-friendly slug from team names
 * Example: "Leeds United" + "Sheffield United" -> "leeds-united-vs-sheffield-united"
 */
export function generateMatchSlug(homeTeam: string, awayTeam: string): string {
  return `${slugifyTeamName(homeTeam)}-vs-${slugifyTeamName(awayTeam)}`;
}

/**
 * Generate meta title for match thread
 * Example: "Leeds United vs Sheffield United"
 */
export function generateMatchTitle(homeTeam: string, awayTeam: string): string {
  return `${homeTeam} vs ${awayTeam}`;
}

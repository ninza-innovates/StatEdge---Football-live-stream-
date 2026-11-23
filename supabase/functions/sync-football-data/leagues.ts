/**
 * Competitions this project stores.
 * The sync function is public, so a request may only name ids from this list.
 */
export const TARGET_LEAGUES = [2, 3, 39, 40, 41, 61, 78, 88, 94, 135, 140, 253] as const;

export type LeagueSelection =
  | { ok: true; leagueIds: number[] }
  | { ok: false; error: string };

type SearchParamsLike = {
  get(name: string): string | null;
};

/**
 * Choose which leagues a sync run may touch.
 * No `league` or `leagues` query (the cron call) syncs every supported league.
 * An override may only repeat ids from `allowed`. Invalid or unknown ids reject
 * the whole request, so a public caller cannot spend the API-Football quota on
 * other competitions or turn a typo into a full sync.
 * When both params are set, `leagues` wins.
 */
export function resolveSyncLeagueIds(
  params: SearchParamsLike,
  allowed: readonly number[] = TARGET_LEAGUES,
): LeagueSelection {
  const leaguesParam = params.get("leagues");
  const leagueParam = params.get("league");
  const raw = leaguesParam?.trim()
    ? leaguesParam
    : leagueParam?.trim()
      ? leagueParam
      : null;

  if (raw === null) {
    return { ok: true, leagueIds: [...allowed] };
  }

  const allowedSet = new Set(allowed);
  const leagueIds: number[] = [];
  const seen = new Set<number>();
  const invalid: string[] = [];
  const unsupported: string[] = [];

  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) continue;

    if (!/^\d+$/.test(token)) {
      invalid.push(token);
      continue;
    }

    const id = Number(token);
    if (!Number.isSafeInteger(id) || !allowedSet.has(id)) {
      unsupported.push(token);
      continue;
    }

    if (!seen.has(id)) {
      seen.add(id);
      leagueIds.push(id);
    }
  }

  if (invalid.length || unsupported.length) {
    const problems: string[] = [];
    if (invalid.length) problems.push(`Invalid league id: ${invalid.join(", ")}`);
    if (unsupported.length) {
      problems.push(
        `Unsupported league id: ${unsupported.join(", ")}. Supported leagues: ${allowed.join(", ")}`,
      );
    }
    return { ok: false, error: problems.join(". ") };
  }

  if (!leagueIds.length) {
    return { ok: false, error: "No league ids provided" };
  }

  return { ok: true, leagueIds };
}

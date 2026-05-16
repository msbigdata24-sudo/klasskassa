import { SecretSantaTier } from "@prisma/client";

/** Лимит участников при стандартном тарифе (бесплатно внутри группы). */
export const SECRET_SANTA_STANDARD_MAX_OPTED_IN = 40;

/** Лимит при корпоративном тарифе (после оплаты / ручной разблокировки). */
export const SECRET_SANTA_CORPORATE_MAX_OPTED_IN = 500;

/** Ориентир цены для лендинга (фактическая оплата — позже). */
export const SECRET_SANTA_CORPORATE_PRICE_FROM_RUB = 4900;

export function secretSantaMaxOptedIn(tier: SecretSantaTier): number {
  return tier === "CORPORATE" ? SECRET_SANTA_CORPORATE_MAX_OPTED_IN : SECRET_SANTA_STANDARD_MAX_OPTED_IN;
}

export type ExclusionPair = readonly [string, string];

/** Пара не может дарить друг другу (в обе стороны). */
export function isGiftForbidden(giver: string, receiver: string, exclusions: ExclusionPair[]): boolean {
  if (giver === receiver) return true;
  for (const [a, b] of exclusions) {
    if ((giver === a && receiver === b) || (giver === b && receiver === a)) return true;
  }
  return false;
}

/**
 * Жеребьёвка: биекция giver → receiver, без самоподарков и с учётом исключений.
 * Детерминированный порядок givers (по id) + DFS.
 */
export function computeSecretSantaAssignments(
  giverIds: string[],
  exclusions: ExclusionPair[],
): Map<string, string> | null {
  const receivers = [...giverIds].sort((a, b) => a.localeCompare(b));
  const givers = [...giverIds].sort((a, b) => a.localeCompare(b));
  const n = givers.length;
  if (n < 2) return null;

  const assignment = new Map<string, string>();
  const usedReceiver = new Set<string>();

  function dfs(i: number): boolean {
    if (i === n) return true;
    const g = givers[i];
    for (const r of receivers) {
      if (usedReceiver.has(r)) continue;
      if (isGiftForbidden(g, r, exclusions)) continue;
      assignment.set(g, r);
      usedReceiver.add(r);
      if (dfs(i + 1)) return true;
      usedReceiver.delete(r);
      assignment.delete(g);
    }
    return false;
  }

  return dfs(0) ? assignment : null;
}

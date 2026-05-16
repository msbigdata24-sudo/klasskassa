export const FREE_DAILY_EXPENSE_LIMIT = 8;
export const PRO_PRICE_MONTH_RUB = 199;
export const PRO_PRICE_YEAR_RUB = 1790;

export function isUserPro(user: { isPro: boolean; proUntil: Date | null }) {
  if (!user.isPro) return false;
  if (!user.proUntil) return true;
  return user.proUntil.getTime() > Date.now();
}

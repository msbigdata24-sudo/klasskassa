/** Equal split in whole cents; first `remainder` users get +1 kopek. */
export function equalSplitCents(totalCents: number, userIds: string[]) {
  if (userIds.length === 0) {
    throw new Error("Нужен хотя бы один участник для разделения");
  }
  const sorted = [...userIds].sort();
  const n = sorted.length;
  const base = Math.floor(totalCents / n);
  const rem = totalCents % n;
  return sorted.map((userId, i) => ({
    userId,
    shareCents: base + (i < rem ? 1 : 0),
  }));
}

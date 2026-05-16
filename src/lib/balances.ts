/**
 * Net balance per user in a group (cents).
 * Positive = the user is owed money overall; negative = they owe.
 */
export function computeNetByUserId(
  expenses: {
    payerId: string;
    amountCents: number;
    splits: { userId: string; shareCents: number; status?: "PENDING" | "ACCEPTED" | "DISPUTED" }[];
  }[],
): Map<string, number> {
  const net = new Map<string, number>();

  const add = (userId: string, delta: number) => {
    net.set(userId, (net.get(userId) ?? 0) + delta);
  };

  for (const e of expenses) {
    add(e.payerId, e.amountCents);
    for (const s of e.splits) {
      if (s.status && s.status !== "ACCEPTED") continue;
      add(s.userId, -s.shareCents);
    }
  }

  return net;
}

/** Greedy pairwise settlement suggestions (cents). */
export function simplifyDebts(net: Map<string, number>): { from: string; to: string; cents: number }[] {
  const debtors: { id: string; owe: number }[] = [];
  const creditors: { id: string; receive: number }[] = [];

  for (const [id, v] of net.entries()) {
    if (v === 0) continue;
    if (v < 0) debtors.push({ id, owe: -v });
    else creditors.push({ id, receive: v });
  }

  debtors.sort((a, b) => b.owe - a.owe);
  creditors.sort((a, b) => b.receive - a.receive);

  const out: { from: string; to: string; cents: number }[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].owe, creditors[j].receive);
    if (pay > 0) {
      out.push({ from: debtors[i].id, to: creditors[j].id, cents: pay });
    }
    debtors[i].owe -= pay;
    creditors[j].receive -= pay;
    if (debtors[i].owe <= 0) i++;
    if (creditors[j].receive <= 0) j++;
  }

  return out;
}

import { SettlementStatus } from "@prisma/client";
import { computeNetByUserId, simplifyDebts } from "@/lib/balances";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export async function loadGroupDetailForUser(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!member) return null;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { user: { name: "asc" } },
      },
      expenses: {
        orderBy: { createdAt: "desc" },
        include: {
          payer: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          splits: { include: { user: { select: { id: true, name: true } } } },
        },
      },
      settlements: {
        orderBy: { settledAt: "desc" },
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!group) return null;

  const memberIds = new Set(group.members.map((m) => m.user.id));

  const net = computeNetByUserId(
    group.expenses
      .filter((e) => memberIds.has(e.payerId))
      .map((e) => ({
        payerId: e.payerId,
        amountCents: e.amountCents,
        splits: e.splits
          .filter((s) => memberIds.has(s.userId))
          .map((s) => ({ userId: s.userId, shareCents: s.shareCents, status: s.status })),
      })),
  );

  for (const m of group.members) {
    const uid = m.user.id;
    if (!net.has(uid)) net.set(uid, 0);
  }

  for (const s of group.settlements) {
    if (s.status !== SettlementStatus.CONFIRMED) continue;
    if (!memberIds.has(s.fromUserId) || !memberIds.has(s.toUserId)) continue;
    net.set(s.fromUserId, (net.get(s.fromUserId) ?? 0) + s.amountCents);
    net.set(s.toUserId, (net.get(s.toUserId) ?? 0) - s.amountCents);
  }

  const suggestions = simplifyDebts(net);
  const userById = new Map(group.members.map((m) => [m.user.id, m.user]));

  return { group, net, suggestions, userById };
}

export function mapGroupToView(
  group: NonNullable<Awaited<ReturnType<typeof loadGroupDetailForUser>>>["group"],
  net: Map<string, number>,
  suggestions: { from: string; to: string; cents: number }[],
  userById: Map<string, { id: string; email: string; name: string }>,
) {
  const adminCount = group.members.filter((m) => m.role === "ADMIN").length;
  return {
    id: group.id,
    name: group.name,
    currency: group.currency,
    isArchived: group.isArchived,
    archivedAt: group.archivedAt,
    inviteCode: group.inviteCode,
    inviteActive: group.inviteActive,
    members: group.members.map((m) => ({ ...m.user, role: m.role })),
    adminCount,
    expenses: group.expenses.map((e) => ({
      id: e.id,
      title: e.title,
      payerId: e.payerId,
      categoryName: e.categoryName ?? e.category?.name ?? null,
      note: e.note,
      spentAt: e.spentAt,
      receiptUrl: e.receiptUrl,
      amountCents: e.amountCents,
      amountLabel: formatCents(e.amountCents, group.currency),
      createdAt: e.createdAt,
      payer: e.payer,
      splits: e.splits.map((s) => ({
        userId: s.userId,
        name: s.user.name,
        shareCents: s.shareCents,
        shareLabel: formatCents(s.shareCents, group.currency),
        status: s.status,
        disputeNote: s.disputeNote,
      })),
    })),
    settlements: group.settlements.map((s) => ({
      id: s.id,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      fromName: s.fromUser.name,
      toName: s.toUser.name,
      amountCents: s.amountCents,
      amountLabel: formatCents(s.amountCents, group.currency),
      note: s.note,
      settledAt: s.settledAt,
      createdAt: s.createdAt,
      status: s.status,
    })),
    history: [...group.expenses.map((e) => ({
      kind: "expense" as const,
      id: e.id,
      at: e.spentAt,
      payerId: e.payerId,
      participantUserIds: e.splits.map((s) => s.userId),
      title: e.title,
      categoryName: e.categoryName ?? e.category?.name ?? null,
      note: e.note,
      amountCents: e.amountCents,
      amountLabel: formatCents(e.amountCents, group.currency),
      payerName: e.payer.name,
      splitSummary: e.splits.map((s) => `${s.user.name} ${formatCents(s.shareCents, group.currency)}`).join(" · "),
      pendingCount: e.splits.filter((s) => s.status === "PENDING").length,
      disputedCount: e.splits.filter((s) => s.status === "DISPUTED").length,
      splitStatuses: e.splits.map((s) => ({
        userId: s.userId,
        userName: s.user.name,
        status: s.status,
        disputeNote: s.disputeNote,
      })),
    })), ...group.settlements.map((s) => ({
      kind: "settlement" as const,
      id: s.id,
      at: s.settledAt,
      amountCents: s.amountCents,
      amountLabel: formatCents(s.amountCents, group.currency),
      fromName: s.fromUser.name,
      toName: s.toUser.name,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      note: s.note,
      status: s.status,
    }))].sort((a, b) => b.at.getTime() - a.at.getTime()),
    balances: {
      netByUserId: Object.fromEntries(net.entries()),
      netLabels: Object.fromEntries(
        [...net.entries()].map(([uid, cents]) => [uid, formatCents(cents, group.currency)]),
      ),
      /** По убыванию «кому должны больше всего» (удобно сравнивать со Splitwise). */
      memberRows: [...group.members]
        .map((m) => {
          const cents = net.get(m.user.id) ?? 0;
          const hint =
            cents === 0
              ? "В нуле: не должен и ему не должны."
              : cents > 0
                ? "Переплатил свою долю — ему должны вернуть."
                : "Недоплатил свою долю — должен внести.";
          return {
            userId: m.user.id,
            name: m.user.name,
            cents,
            signedLabel: formatCents(cents, group.currency),
            hint,
          };
        })
        .sort((a, b) => b.cents - a.cents),
      suggestions: suggestions.map((s) => ({
        from: s.from,
        to: s.to,
        cents: s.cents,
        label: formatCents(s.cents, group.currency),
        fromName: userById.get(s.from)?.name ?? s.from,
        toName: userById.get(s.to)?.name ?? s.to,
      })),
    },
  };
}

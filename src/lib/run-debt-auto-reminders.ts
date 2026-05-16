import { SettlementStatus } from "@prisma/client";
import { computeNetByUserId, simplifyDebts } from "@/lib/balances";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";
import { touchGroup } from "@/lib/touch-group";
import { DEBT_REMINDER_COOLDOWN_DAYS, DEBT_REMINDER_MIN_CENTS, DEBT_REMINDER_STALE_DAYS } from "@/lib/debt-reminder-config";

const MS_DAY = 24 * 60 * 60 * 1000;

type Meta = { fromUserId?: string; toUserId?: string };

function metaMatch(m: unknown, fromId: string, toId: string) {
  const o = (m ?? {}) as Meta;
  return o.fromUserId === fromId && o.toUserId === toId;
}

async function referenceTimeForEdge(groupId: string, groupCreatedAt: Date, fromId: string, toId: string): Promise<Date> {
  const [lastConfirmed, lastExpense] = await Promise.all([
    prisma.settlement.findFirst({
      where: { groupId, fromUserId: fromId, toUserId: toId, status: SettlementStatus.CONFIRMED },
      orderBy: { settledAt: "desc" },
      select: { settledAt: true },
    }),
    prisma.expense.findFirst({
      where: {
        groupId,
        payerId: toId,
        splits: { some: { userId: fromId, status: "ACCEPTED" } },
      },
      orderBy: { spentAt: "desc" },
      select: { spentAt: true },
    }),
  ]);
  const times: number[] = [groupCreatedAt.getTime()];
  if (lastConfirmed?.settledAt) times.push(lastConfirmed.settledAt.getTime());
  if (lastExpense?.spentAt) times.push(lastExpense.spentAt.getTime());
  return new Date(Math.max(...times));
}

/**
 * Для всех неархивных групп: мягкие push-напоминания должникам по подсказкам simplifyDebts,
 * если давно не было подтверждённого погашения по этой паре и нет «висящего» погашения на подтверждении.
 */
export async function runDebtAutoReminders(): Promise<{ groupsScanned: number; remindersSent: number }> {
  const now = Date.now();
  const staleMs = DEBT_REMINDER_STALE_DAYS * MS_DAY;
  const cooldownMs = DEBT_REMINDER_COOLDOWN_DAYS * MS_DAY;

  const groups = await prisma.group.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      currency: true,
      createdAt: true,
      members: { select: { userId: true, user: { select: { id: true, name: true } } } },
    },
  });

  let remindersSent = 0;

  for (const g of groups) {
    if (g.members.length < 2) continue;

    const [expenses, settlements, recentAuto] = await Promise.all([
      prisma.expense.findMany({
        where: { groupId: g.id },
        include: { splits: true },
      }),
      prisma.settlement.findMany({ where: { groupId: g.id } }),
      prisma.activityEvent.findMany({
        where: { groupId: g.id, kind: "DEBT_REMINDER_AUTO" },
        orderBy: { createdAt: "desc" },
        take: 80,
        select: { createdAt: true, metadata: true },
      }),
    ]);

    const memberIds = new Set(g.members.map((m) => m.userId));
    const net = computeNetByUserId(
      expenses
        .filter((e) => memberIds.has(e.payerId))
        .map((e) => ({
          payerId: e.payerId,
          amountCents: e.amountCents,
          splits: e.splits
            .filter((s) => memberIds.has(s.userId))
            .map((s) => ({ userId: s.userId, shareCents: s.shareCents, status: s.status })),
        })),
    );
    for (const m of g.members) if (!net.has(m.userId)) net.set(m.userId, 0);
    for (const s of settlements) {
      if (s.status !== SettlementStatus.CONFIRMED) continue;
      if (!memberIds.has(s.fromUserId) || !memberIds.has(s.toUserId)) continue;
      net.set(s.fromUserId, (net.get(s.fromUserId) ?? 0) + s.amountCents);
      net.set(s.toUserId, (net.get(s.toUserId) ?? 0) - s.amountCents);
    }

    const hints = simplifyDebts(net);
    const nameById = new Map(g.members.map((m) => [m.userId, m.user.name]));

    for (const h of hints) {
      if (h.cents < DEBT_REMINDER_MIN_CENTS) continue;

      const awaiting = settlements.some(
        (s) =>
          s.status === SettlementStatus.AWAITING_CREDITOR &&
          s.fromUserId === h.from &&
          s.toUserId === h.to,
      );
      if (awaiting) continue;

      const ref = await referenceTimeForEdge(g.id, g.createdAt, h.from, h.to);
      if (now - ref.getTime() < staleMs) continue;

      const lastSame = recentAuto.find((e) => metaMatch(e.metadata, h.from, h.to));
      if (lastSame && now - lastSame.createdAt.getTime() < cooldownMs) continue;

      await logActivity({
        groupId: g.id,
        actorId: null,
        kind: "DEBT_REMINDER_AUTO",
        text: `Напоминание: ${nameById.get(h.from) ?? "Участник"}, не забудьте перевести ${(h.cents / 100).toFixed(2)} ${g.currency} пользователю ${nameById.get(h.to) ?? "участник"}.`,
        metadata: { fromUserId: h.from, toUserId: h.to, cents: h.cents },
      });
      await sendPushToUsers({
        userIds: [h.from],
        actorId: null,
        groupId: g.id,
        kind: "settlement",
        title: "Напоминание о переводе",
        body: `Переведите ${(h.cents / 100).toFixed(2)} ${g.currency} ${nameById.get(h.to) ?? "участнику"} — долг давно не закрывался.`,
        url: `/groups/${g.id}`,
      });
      remindersSent += 1;
      await touchGroup(g.id);
    }
  }

  return { groupsScanned: groups.length, remindersSent };
}

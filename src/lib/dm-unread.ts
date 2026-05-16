import { prisma } from "@/lib/prisma";

export async function getUnreadDmTotal(userId: string) {
  const [marks, incoming] = await Promise.all([
    prisma.directMessageRead.findMany({
      where: { userId },
      select: { groupId: true, peerUserId: true, lastReadAt: true },
    }),
    prisma.directMessage.findMany({
      where: {
        toUserId: userId,
        group: {
          members: {
            some: { userId },
          },
        },
      },
      select: { groupId: true, fromUserId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  const readMap = new Map(marks.map((m) => [`${m.groupId}:${m.peerUserId}`, m.lastReadAt.getTime()]));
  let unread = 0;
  for (const msg of incoming) {
    const lastRead = readMap.get(`${msg.groupId}:${msg.fromUserId}`) ?? 0;
    if (msg.createdAt.getTime() > lastRead) unread += 1;
  }
  return unread;
}

export async function getUnreadDmHints(userId: string) {
  const [marks, incoming] = await Promise.all([
    prisma.directMessageRead.findMany({
      where: { userId },
      select: { groupId: true, peerUserId: true, lastReadAt: true },
    }),
    prisma.directMessage.findMany({
      where: {
        toUserId: userId,
        group: {
          members: {
            some: { userId },
          },
        },
      },
      select: {
        id: true,
        groupId: true,
        fromUserId: true,
        createdAt: true,
        fromUser: { select: { name: true } },
        group: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  const readMap = new Map(marks.map((m) => [`${m.groupId}:${m.peerUserId}`, m.lastReadAt.getTime()]));
  /** One row per (group + собеседник), not merged across peers in the same group. */
  const perThread = new Map<
    string,
    {
      groupId: string;
      groupName: string;
      unreadCount: number;
      latestAtMs: number;
      peerUserId: string;
      peerName: string;
    }
  >();

  for (const msg of incoming) {
    const lastRead = readMap.get(`${msg.groupId}:${msg.fromUserId}`) ?? 0;
    const ts = msg.createdAt.getTime();
    if (ts <= lastRead) continue;

    const key = `${msg.groupId}:${msg.fromUserId}`;
    const existing = perThread.get(key);
    if (!existing) {
      perThread.set(key, {
        groupId: msg.groupId,
        groupName: msg.group.name,
        unreadCount: 1,
        latestAtMs: ts,
        peerUserId: msg.fromUserId,
        peerName: msg.fromUser.name,
      });
      continue;
    }
    existing.unreadCount += 1;
    if (ts > existing.latestAtMs) existing.latestAtMs = ts;
  }

  return [...perThread.values()]
    .sort((a, b) => b.latestAtMs - a.latestAtMs)
    .map(({ latestAtMs, ...rest }) => ({
      ...rest,
      latestAtIso: new Date(latestAtMs).toISOString(),
    }));
}

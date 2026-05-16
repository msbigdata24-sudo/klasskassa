import webpush from "web-push";
import { getPushVapidPrivateKey, getPushVapidPublicKey, getPushVapidSubject } from "@/lib/env";
import { prisma } from "@/lib/prisma";

let initialized = false;

function initWebPush() {
  if (initialized) return true;
  const publicKey = getPushVapidPublicKey();
  const privateKey = getPushVapidPrivateKey();
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(getPushVapidSubject(), publicKey, privateKey);
  initialized = true;
  return true;
}

export function getPublicPushKey() {
  return getPushVapidPublicKey();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export async function sendPushToUsers(params: {
  userIds: string[];
  actorId?: string | null;
  groupId?: string;
  kind: "dm" | "group_chat" | "expense" | "settlement" | "invite";
  title: string;
  body: string;
  url: string;
}) {
  if (!initWebPush()) return;
  const uniqueUserIds = [...new Set(params.userIds.filter((id) => id && id !== params.actorId))];
  if (!uniqueUserIds.length) return;

  const [settings, subscriptions] = await Promise.all([
    prisma.userNotificationSettings.findMany({
      where: { userId: { in: uniqueUserIds }, pushEnabled: true },
      select: {
        userId: true,
        pushOnDm: true,
        pushOnGroupChat: true,
        pushOnExpense: true,
        pushOnSettlement: true,
        pushOnInvite: true,
        groupScope: true,
        selectedGroupIds: true,
      },
    }),
    prisma.pushSubscription.findMany({
      where: { userId: { in: uniqueUserIds } },
      select: { id: true, userId: true, endpoint: true, p256dh: true, auth: true },
    }),
  ]);

  const settingByUser = new Map(settings.map((s) => [s.userId, s]));
  const kindKey: Record<(typeof params)["kind"], keyof (typeof settings)[number]> = {
    dm: "pushOnDm",
    group_chat: "pushOnGroupChat",
    expense: "pushOnExpense",
    settlement: "pushOnSettlement",
    invite: "pushOnInvite",
  };
  const toggleKey = kindKey[params.kind];

  const allowedUserIds = new Set<string>();
  for (const userId of uniqueUserIds) {
    const s = settingByUser.get(userId);
    if (!s || !s[toggleKey]) continue;
    if (params.groupId && s.groupScope === "SELECTED") {
      const selected = asStringArray(s.selectedGroupIds);
      if (!selected.includes(params.groupId)) continue;
    }
    allowedUserIds.add(userId);
  }
  if (!allowedUserIds.size) return;

  const payload = JSON.stringify({
    title: params.title,
    body: params.body,
    url: params.url,
    ts: Date.now(),
  });

  const deadSubscriptionIds: string[] = [];
  await Promise.all(
    subscriptions
      .filter((sub) => allowedUserIds.has(sub.userId))
      .map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
        } catch (err) {
          const statusCode = typeof err === "object" && err && "statusCode" in err ? Number((err as { statusCode?: number }).statusCode) : 0;
          if (statusCode === 404 || statusCode === 410) {
            deadSubscriptionIds.push(sub.id);
          }
        }
      }),
  );

  if (deadSubscriptionIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: deadSubscriptionIds } } });
  }
}

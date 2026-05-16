"use client";

type ExpenseQueuePayload = {
  title: string;
  amount: string;
  payerId: string;
  participantIds: string[];
  categoryName: string;
  spentAt: string;
  note: string;
  receiptUrl?: string;
  idemKey: string;
};

type SettlementQueuePayload = {
  fromUserId: string;
  toUserId: string;
  amount: string;
  note: string;
  settledAt: string;
  idemKey: string;
};

type GroupChatQueuePayload = {
  text: string;
  audioBase64: string | null;
  audioMime: string;
  idemKey: string;
};

type DmQueuePayload = {
  toUserId: string;
  text: string;
  audioBase64: string | null;
  audioMime: string;
  idemKey: string;
};

type MutationQueuePayload = {
  url: string;
  method: "PATCH" | "DELETE";
  body?: unknown;
  kind: "expense_update" | "expense_delete" | "settlement_update" | "settlement_delete";
  conflictBaseAtIso?: string;
};

type ExpenseQueueItem = {
  id: string;
  groupId: string;
  createdAtIso: string;
  payload: ExpenseQueuePayload;
};

type SettlementQueueItem = {
  id: string;
  groupId: string;
  createdAtIso: string;
  payload: SettlementQueuePayload;
};

type GroupChatQueueItem = {
  id: string;
  groupId: string;
  createdAtIso: string;
  payload: GroupChatQueuePayload;
};

type DmQueueItem = {
  id: string;
  groupId: string;
  createdAtIso: string;
  payload: DmQueuePayload;
};

type MutationQueueItem = {
  id: string;
  groupId: string;
  createdAtIso: string;
  payload: MutationQueuePayload;
};

const DB_NAME = "apelsin-offline-queue-v1";
const DB_VERSION = 1;
const EXPENSE_STORE = "expenseQueue";
const SETTLEMENT_STORE = "settlementQueue";
const GROUP_CHAT_STORE = "groupChatQueue";
const DM_STORE = "dmQueue";
const MUTATION_STORE = "mutationQueue";
const SYNC_STATS_KEY = "apelsin-offline-sync-stats-v1";

type OfflineSyncStats = {
  runs: number;
  totalSent: number;
  totalFailed: number;
  lastRunAtIso: string | null;
  lastSent: number;
  lastFailed: number;
  lastRemaining: number;
  lastError: string | null;
};

function canUseIndexedDb() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(EXPENSE_STORE)) {
        db.createObjectStore(EXPENSE_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SETTLEMENT_STORE)) {
        db.createObjectStore(SETTLEMENT_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(GROUP_CHAT_STORE)) {
        db.createObjectStore(GROUP_CHAT_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(DM_STORE)) {
        db.createObjectStore(DM_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(MUTATION_STORE)) {
        db.createObjectStore(MUTATION_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open IndexedDB"));
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  return await new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(Array.isArray(req.result) ? (req.result as T[]) : []);
    req.onerror = () => reject(req.error ?? new Error("Failed to read queue"));
  });
}

async function putInStore<T>(storeName: string, value: T): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Failed to write queue"));
  });
}

async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Failed to delete queue item"));
  });
}

function makeQueueId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const defaultSyncStats: OfflineSyncStats = {
  runs: 0,
  totalSent: 0,
  totalFailed: 0,
  lastRunAtIso: null,
  lastSent: 0,
  lastFailed: 0,
  lastRemaining: 0,
  lastError: null,
};

export function getOfflineSyncStats(): OfflineSyncStats {
  if (!canUseStorage()) return defaultSyncStats;
  try {
    const raw = window.localStorage.getItem(SYNC_STATS_KEY);
    if (!raw) return defaultSyncStats;
    const parsed = JSON.parse(raw) as Partial<OfflineSyncStats>;
    return {
      runs: Number(parsed.runs ?? 0),
      totalSent: Number(parsed.totalSent ?? 0),
      totalFailed: Number(parsed.totalFailed ?? 0),
      lastRunAtIso: typeof parsed.lastRunAtIso === "string" ? parsed.lastRunAtIso : null,
      lastSent: Number(parsed.lastSent ?? 0),
      lastFailed: Number(parsed.lastFailed ?? 0),
      lastRemaining: Number(parsed.lastRemaining ?? 0),
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : null,
    };
  } catch {
    return defaultSyncStats;
  }
}

function saveOfflineSyncStats(stats: OfflineSyncStats) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(SYNC_STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage errors
  }
}

export function recordOfflineSyncRun(result: { totalSent: number; totalFailed: number; totalRemaining: number }) {
  const current = getOfflineSyncStats();
  saveOfflineSyncStats({
    runs: current.runs + 1,
    totalSent: current.totalSent + Math.max(0, result.totalSent),
    totalFailed: current.totalFailed + Math.max(0, result.totalFailed),
    lastRunAtIso: new Date().toISOString(),
    lastSent: Math.max(0, result.totalSent),
    lastFailed: Math.max(0, result.totalFailed),
    lastRemaining: Math.max(0, result.totalRemaining),
    lastError: null,
  });
}

export function recordOfflineSyncError(message: string) {
  const current = getOfflineSyncStats();
  saveOfflineSyncStats({
    ...current,
    runs: current.runs + 1,
    totalFailed: current.totalFailed + 1,
    lastRunAtIso: new Date().toISOString(),
    lastSent: 0,
    lastFailed: 1,
    lastError: message || "unknown_sync_error",
  });
}

export function enqueueOfflineExpense(groupId: string, payload: ExpenseQueuePayload) {
  return enqueueOfflineExpenseAsync(groupId, payload);
}

export function enqueueOfflineSettlement(groupId: string, payload: SettlementQueuePayload) {
  return enqueueOfflineSettlementAsync(groupId, payload);
}

export function getOfflineQueueCounts(groupId: string) {
  return getOfflineQueueCountsAsync(groupId);
}

export function enqueueOfflineGroupChatMessage(groupId: string, payload: GroupChatQueuePayload) {
  return enqueueOfflineGroupChatMessageAsync(groupId, payload);
}

export function enqueueOfflineDm(groupId: string, payload: DmQueuePayload) {
  return enqueueOfflineDmAsync(groupId, payload);
}

export function enqueueOfflineMutation(groupId: string, payload: MutationQueuePayload) {
  return enqueueOfflineMutationAsync(groupId, payload);
}

export async function flushOfflineExpenseQueue(groupId: string) {
  let queue: ExpenseQueueItem[] = [];
  try {
    queue = await getAllFromStore<ExpenseQueueItem>(EXPENSE_STORE);
  } catch {
    return { sent: 0, remaining: 0, failed: 0 };
  }
  let sent = 0;
  let failed = 0;
  for (const item of queue) {
    if (item.groupId !== groupId) continue;
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      if (!res.ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await deleteFromStore(EXPENSE_STORE, item.id);
    } catch {
      failed += 1;
    }
  }
  const remaining = (await getAllFromStore<ExpenseQueueItem>(EXPENSE_STORE).catch(() => [] as ExpenseQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return { sent, remaining, failed };
}

export async function flushOfflineSettlementQueue(groupId: string) {
  let queue: SettlementQueueItem[] = [];
  try {
    queue = await getAllFromStore<SettlementQueueItem>(SETTLEMENT_STORE);
  } catch {
    return { sent: 0, remaining: 0, failed: 0 };
  }
  let sent = 0;
  let failed = 0;
  for (const item of queue) {
    if (item.groupId !== groupId) continue;
    try {
      const res = await fetch(`/api/groups/${groupId}/settlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      if (!res.ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await deleteFromStore(SETTLEMENT_STORE, item.id);
    } catch {
      failed += 1;
    }
  }
  const remaining = (await getAllFromStore<SettlementQueueItem>(SETTLEMENT_STORE).catch(() => [] as SettlementQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return { sent, remaining, failed };
}

export async function flushOfflineGroupChatQueue(groupId: string) {
  let queue: GroupChatQueueItem[] = [];
  try {
    queue = await getAllFromStore<GroupChatQueueItem>(GROUP_CHAT_STORE);
  } catch {
    return { sent: 0, remaining: 0, failed: 0 };
  }
  let sent = 0;
  let failed = 0;
  for (const item of queue) {
    if (item.groupId !== groupId) continue;
    try {
      const res = await fetch(`/api/groups/${groupId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      if (!res.ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await deleteFromStore(GROUP_CHAT_STORE, item.id);
    } catch {
      failed += 1;
    }
  }
  const remaining = (await getAllFromStore<GroupChatQueueItem>(GROUP_CHAT_STORE).catch(() => [] as GroupChatQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return { sent, remaining, failed };
}

export async function flushOfflineDmQueue(groupId: string) {
  let queue: DmQueueItem[] = [];
  try {
    queue = await getAllFromStore<DmQueueItem>(DM_STORE);
  } catch {
    return { sent: 0, remaining: 0, failed: 0 };
  }
  let sent = 0;
  let failed = 0;
  for (const item of queue) {
    if (item.groupId !== groupId) continue;
    try {
      const res = await fetch(`/api/groups/${groupId}/dm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      if (!res.ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await deleteFromStore(DM_STORE, item.id);
    } catch {
      failed += 1;
    }
  }
  const remaining = (await getAllFromStore<DmQueueItem>(DM_STORE).catch(() => [] as DmQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return { sent, remaining, failed };
}

export async function flushOfflineMutationQueue(groupId: string) {
  let queue: MutationQueueItem[] = [];
  try {
    queue = await getAllFromStore<MutationQueueItem>(MUTATION_STORE);
  } catch {
    return { sent: 0, remaining: 0, failed: 0 };
  }
  let sent = 0;
  let failed = 0;
  for (const item of queue) {
    if (item.groupId !== groupId) continue;
    try {
      const res = await fetch(item.payload.url, {
        method: item.payload.method,
        headers: item.payload.body ? { "Content-Type": "application/json" } : undefined,
        body: item.payload.body ? JSON.stringify(item.payload.body) : undefined,
      });
      if (!res.ok) {
        if (res.status === 409) {
          // Conflict with a newer edit from another device: drop this stale queued mutation.
          await deleteFromStore(MUTATION_STORE, item.id);
        }
        failed += 1;
        continue;
      }
      sent += 1;
      await deleteFromStore(MUTATION_STORE, item.id);
    } catch {
      failed += 1;
    }
  }
  const remaining = (await getAllFromStore<MutationQueueItem>(MUTATION_STORE).catch(() => [] as MutationQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return { sent, remaining, failed };
}

export async function enqueueOfflineExpenseAsync(groupId: string, payload: ExpenseQueuePayload) {
  const item: ExpenseQueueItem = { id: makeQueueId("offexp"), groupId, createdAtIso: new Date().toISOString(), payload };
  await putInStore(EXPENSE_STORE, item).catch(() => null);
  const expenseCount = (await getAllFromStore<ExpenseQueueItem>(EXPENSE_STORE).catch(() => [] as ExpenseQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return expenseCount;
}

export async function enqueueOfflineSettlementAsync(groupId: string, payload: SettlementQueuePayload) {
  const item: SettlementQueueItem = { id: makeQueueId("offset"), groupId, createdAtIso: new Date().toISOString(), payload };
  await putInStore(SETTLEMENT_STORE, item).catch(() => null);
  const settlementCount = (await getAllFromStore<SettlementQueueItem>(SETTLEMENT_STORE).catch(() => [] as SettlementQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return settlementCount;
}

export async function enqueueOfflineGroupChatMessageAsync(groupId: string, payload: GroupChatQueuePayload) {
  const item: GroupChatQueueItem = { id: makeQueueId("offchat"), groupId, createdAtIso: new Date().toISOString(), payload };
  await putInStore(GROUP_CHAT_STORE, item).catch(() => null);
  const count = (await getAllFromStore<GroupChatQueueItem>(GROUP_CHAT_STORE).catch(() => [] as GroupChatQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return count;
}

export async function enqueueOfflineDmAsync(groupId: string, payload: DmQueuePayload) {
  const item: DmQueueItem = { id: makeQueueId("offdm"), groupId, createdAtIso: new Date().toISOString(), payload };
  await putInStore(DM_STORE, item).catch(() => null);
  const count = (await getAllFromStore<DmQueueItem>(DM_STORE).catch(() => [] as DmQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return count;
}

export async function enqueueOfflineMutationAsync(groupId: string, payload: MutationQueuePayload) {
  const item: MutationQueueItem = { id: makeQueueId("offmut"), groupId, createdAtIso: new Date().toISOString(), payload };
  await putInStore(MUTATION_STORE, item).catch(() => null);
  const count = (await getAllFromStore<MutationQueueItem>(MUTATION_STORE).catch(() => [] as MutationQueueItem[])).filter(
    (x) => x.groupId === groupId,
  ).length;
  return count;
}

export async function getOfflineQueueCountsAsync(groupId: string) {
  const [expenseQueue, settlementQueue, groupChatQueue, dmQueue, mutationQueue] = await Promise.all([
    getAllFromStore<ExpenseQueueItem>(EXPENSE_STORE).catch(() => [] as ExpenseQueueItem[]),
    getAllFromStore<SettlementQueueItem>(SETTLEMENT_STORE).catch(() => [] as SettlementQueueItem[]),
    getAllFromStore<GroupChatQueueItem>(GROUP_CHAT_STORE).catch(() => [] as GroupChatQueueItem[]),
    getAllFromStore<DmQueueItem>(DM_STORE).catch(() => [] as DmQueueItem[]),
    getAllFromStore<MutationQueueItem>(MUTATION_STORE).catch(() => [] as MutationQueueItem[]),
  ]);
  const expenseCount = expenseQueue.filter((x) => x.groupId === groupId).length;
  const settlementCount = settlementQueue.filter((x) => x.groupId === groupId).length;
  const groupChatCount = groupChatQueue.filter((x) => x.groupId === groupId).length;
  const dmCount = dmQueue.filter((x) => x.groupId === groupId).length;
  const mutationCount = mutationQueue.filter((x) => x.groupId === groupId).length;
  return {
    expenseCount,
    settlementCount,
    groupChatCount,
    dmCount,
    mutationCount,
    totalCount: expenseCount + settlementCount + groupChatCount + dmCount + mutationCount,
  };
}

export async function getAllQueuedGroupIds() {
  const [expenseQueue, settlementQueue, groupChatQueue, dmQueue, mutationQueue] = await Promise.all([
    getAllFromStore<ExpenseQueueItem>(EXPENSE_STORE).catch(() => [] as ExpenseQueueItem[]),
    getAllFromStore<SettlementQueueItem>(SETTLEMENT_STORE).catch(() => [] as SettlementQueueItem[]),
    getAllFromStore<GroupChatQueueItem>(GROUP_CHAT_STORE).catch(() => [] as GroupChatQueueItem[]),
    getAllFromStore<DmQueueItem>(DM_STORE).catch(() => [] as DmQueueItem[]),
    getAllFromStore<MutationQueueItem>(MUTATION_STORE).catch(() => [] as MutationQueueItem[]),
  ]);
  const ids = new Set<string>();
  for (const item of expenseQueue) ids.add(item.groupId);
  for (const item of settlementQueue) ids.add(item.groupId);
  for (const item of groupChatQueue) ids.add(item.groupId);
  for (const item of dmQueue) ids.add(item.groupId);
  for (const item of mutationQueue) ids.add(item.groupId);
  return [...ids];
}

export async function flushAllOfflineQueues() {
  const groupIds = await getAllQueuedGroupIds();
  let sentExpenses = 0;
  let sentSettlements = 0;
  let sentGroupChat = 0;
  let sentDm = 0;
  let sentMutations = 0;
  let failedExpenses = 0;
  let failedSettlements = 0;
  let failedGroupChat = 0;
  let failedDm = 0;
  let failedMutations = 0;
  for (const groupId of groupIds) {
    const [expenseResult, settlementResult, groupChatResult, dmResult, mutationResult] = await Promise.all([
      flushOfflineExpenseQueue(groupId),
      flushOfflineSettlementQueue(groupId),
      flushOfflineGroupChatQueue(groupId),
      flushOfflineDmQueue(groupId),
      flushOfflineMutationQueue(groupId),
    ]);
    sentExpenses += expenseResult.sent;
    sentSettlements += settlementResult.sent;
    sentGroupChat += groupChatResult.sent;
    sentDm += dmResult.sent;
    sentMutations += mutationResult.sent;
    failedExpenses += expenseResult.failed;
    failedSettlements += settlementResult.failed;
    failedGroupChat += groupChatResult.failed;
    failedDm += dmResult.failed;
    failedMutations += mutationResult.failed;
  }
  const remainingGroupIds = await getAllQueuedGroupIds();
  const totalRemaining = remainingGroupIds.length
    ? (
        await Promise.all(
          remainingGroupIds.map(async (groupId) => {
            const counts = await getOfflineQueueCountsAsync(groupId);
            return counts.totalCount;
          }),
        )
      ).reduce((sum, x) => sum + x, 0)
    : 0;
  const totalFailed = failedExpenses + failedSettlements + failedGroupChat + failedDm + failedMutations;
  return {
    sentExpenses,
    sentSettlements,
    sentGroupChat,
    sentDm,
    sentMutations,
    failedExpenses,
    failedSettlements,
    failedGroupChat,
    failedDm,
    failedMutations,
    totalFailed,
    totalRemaining,
    totalSent: sentExpenses + sentSettlements + sentGroupChat + sentDm + sentMutations,
  };
}

export async function clearAllOfflineQueues() {
  const db = await openDb().catch(() => null);
  if (!db) return;
  await Promise.all([
    new Promise<void>((resolve) => {
      const tx = db.transaction(EXPENSE_STORE, "readwrite");
      tx.objectStore(EXPENSE_STORE).clear().onsuccess = () => resolve();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    }),
    new Promise<void>((resolve) => {
      const tx = db.transaction(SETTLEMENT_STORE, "readwrite");
      tx.objectStore(SETTLEMENT_STORE).clear().onsuccess = () => resolve();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    }),
    new Promise<void>((resolve) => {
      const tx = db.transaction(GROUP_CHAT_STORE, "readwrite");
      tx.objectStore(GROUP_CHAT_STORE).clear().onsuccess = () => resolve();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    }),
    new Promise<void>((resolve) => {
      const tx = db.transaction(DM_STORE, "readwrite");
      tx.objectStore(DM_STORE).clear().onsuccess = () => resolve();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    }),
    new Promise<void>((resolve) => {
      const tx = db.transaction(MUTATION_STORE, "readwrite");
      tx.objectStore(MUTATION_STORE).clear().onsuccess = () => resolve();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    }),
  ]);
}

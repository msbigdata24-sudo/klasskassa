import { z } from "zod";

export const GIFT_TOKEN_TTL_HOURS = 48;

export const giftPlanCodeSchema = z.enum(["PRO_MONTH", "PRO_YEAR"]);
export type GiftPlanCode = z.infer<typeof giftPlanCodeSchema>;

export const giftPurchaseStatusSchema = z.enum([
  "CREATED",
  "PAID",
  "CLAIMED",
  "CANCELED",
  "REFUNDED",
  "EXPIRED",
]);
export type GiftPurchaseStatus = z.infer<typeof giftPurchaseStatusSchema>;

export const createGiftPurchaseBodySchema = z
  .object({
    planCode: giftPlanCodeSchema,
    recipientEmail: z.string().trim().email().max(320).optional(),
    recipientUserId: z.string().trim().min(1).max(64).optional(),
    idemKey: z.string().trim().min(8).max(120).optional(),
  })
  .refine((v) => !v.recipientEmail || !v.recipientUserId, {
    message: "Укажите либо recipientEmail, либо recipientUserId",
    path: ["recipientEmail"],
  });

export const createGiftPurchaseResponseSchema = z.object({
  giftPurchase: z.object({
    id: z.string(),
    planCode: giftPlanCodeSchema,
    amountCents: z.number().int().positive(),
    currency: z.literal("RUB"),
    status: giftPurchaseStatusSchema,
    paymentProvider: z.string(),
    paymentUrl: z.string().url().optional(),
    giftTokenExpiresAt: z.string(),
    createdAt: z.string(),
  }),
  duplicate: z.boolean().optional(),
});

export const claimGiftBodySchema = z.object({
  token: z.string().trim().min(24).max(256),
});

export const claimGiftResponseSchema = z.object({
  giftPurchase: z.object({
    id: z.string(),
    planCode: giftPlanCodeSchema,
    status: giftPurchaseStatusSchema,
    claimedAt: z.string(),
  }),
  userProUntil: z.string(),
});

export const paymentWebhookBodySchema = z.object({
  provider: z.string().trim().min(1).max(50),
  event: z.string().trim().min(1).max(80),
  paymentId: z.string().trim().min(1).max(120),
  status: z.string().trim().min(1).max(80),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export function calcGiftTokenExpiresAt(now = new Date(), ttlHours = GIFT_TOKEN_TTL_HOURS) {
  return new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
}

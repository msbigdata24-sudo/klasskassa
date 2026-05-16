import crypto from "node:crypto";

const GUEST_EMAIL_DOMAIN = "@klasskassa.guest";
export const GUEST_PASSWORD_HASH_PLACEHOLDER = "guest-account-no-login";

export function isGuestEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(GUEST_EMAIL_DOMAIN);
}

export function generateGuestEmail(): string {
  return `guest-${crypto.randomUUID()}${GUEST_EMAIL_DOMAIN}`;
}

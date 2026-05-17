"use client";

import { useEffect } from "react";
import { SUPPORT_DONATION_URL } from "@/lib/support";

type SupportEvent =
  | "SUPPORT_PAGE_OPENED"
  | "DONATE_LINK_CLICKED"
  | "DONATE_QR_SHOWN"
  | "DONATE_BLOCK_VIEWED_HOME"
  | "DONATE_BLOCK_VIEWED_CLASS";

type Payload = {
  event: SupportEvent;
  location?: string;
  classId?: string;
};

function trackSupportEvent(payload: Payload) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/support/events", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/support/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function SupportEventPing({ event, location, classId }: Payload) {
  useEffect(() => {
    trackSupportEvent({ event, location, classId });
  }, [classId, event, location]);

  return null;
}

export function SupportDonateLink({
  children,
  className,
  location,
  classId,
}: {
  children: React.ReactNode;
  className?: string;
  location?: string;
  classId?: string;
}) {
  return (
    <a
      href={SUPPORT_DONATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackSupportEvent({ event: "DONATE_LINK_CLICKED", location, classId })}
    >
      {children}
    </a>
  );
}

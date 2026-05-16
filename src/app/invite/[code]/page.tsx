import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { JoinCard } from "./join-card";

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ autojoin?: string }> };

export default async function InviteJoinPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { autojoin } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invite/${code}?autojoin=1`)}`);
  return (
    <main className="flex flex-1 flex-col gap-6">
      <JoinCard code={code} autoJoin={autojoin === "1"} />
    </main>
  );
}

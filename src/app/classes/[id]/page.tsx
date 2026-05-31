import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership } from "@/lib/class-access";
import { isGuestEmail } from "@/lib/guest-user";
import { prisma } from "@/lib/prisma";
import { ClassDetailPanel } from "./class-detail-panel";
import { EmailRemindersToggle } from "@/components/email-reminders-toggle";
import { canOptInEmailReminders } from "@/lib/member-roles";

type Props = { params: Promise<{ id: string }> };

export default async function ClassPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id: classId } = await params;

  const membership = await getClassMembership(classId, user.id);
  if (!membership) notFound();

  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      members: {
        orderBy: { user: { name: "asc" } },
        select: {
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      collections: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          amountCents: true,
          deadline: true,
          publicReportCode: true,
          contributions: { select: { isPaid: true } },
        },
      },
      activityEvents: {
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, text: true, createdAt: true, kind: true },
      },
    },
  });
  if (!schoolClass) notFound();

  const isCommittee = membership.role === "COMMITTEE";
  const roleHint =
    membership.role === "COMMITTEE"
      ? "Вы в родительском комитете"
      : membership.role === "VIEWER"
        ? "Роль: только просмотр (без загрузки чеков)"
        : "Вы родитель в этом классе";
  const inviteUrl = `/invite/${schoolClass.inviteCode}`;
  const baseUrl = process.env.APP_BASE_URL ?? "";

  const members = schoolClass.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: isGuestEmail(m.user.email) ? null : m.user.email,
    isGuest: isGuestEmail(m.user.email),
    role: m.role,
  }));

  const collections = schoolClass.collections.map((c) => ({
    id: c.id,
    title: c.title,
    amountCents: c.amountCents,
    deadline: c.deadline?.toISOString() ?? null,
    publicReportCode: c.publicReportCode,
    paidCount: c.contributions.filter((x) => x.isPaid).length,
    total: c.contributions.length,
  }));

  return (
    <main className="flex flex-1 flex-col gap-6">
      <Link href="/classes" className="text-sm text-stone-500 hover:text-brandDark">
        ← к классам
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{schoolClass.name}</h1>
        <p className="mt-1 text-sm text-stone-600">{roleHint}</p>
      </div>
      {canOptInEmailReminders(membership.role) ? (
        <EmailRemindersToggle
          classId={classId}
          initialOptIn={membership.emailRemindersOptIn}
        />
      ) : null}
      <ClassDetailPanel
        classId={classId}
        isCommittee={isCommittee}
        currentUserId={user.id}
        invitePath={inviteUrl}
        inviteAbsolute={baseUrl ? `${baseUrl.replace(/\/$/, "")}${inviteUrl}` : ""}
        members={members}
        collections={collections}
        history={schoolClass.activityEvents.map((e) => ({
          id: e.id,
          text: e.text,
          createdAt: e.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership } from "@/lib/class-access";
import { isGuestEmail } from "@/lib/guest-user";
import { formatRub } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { CollectionPanel } from "./collection-panel";

type Props = { params: Promise<{ id: string; collectionId: string }> };

export default async function CollectionPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id: classId, collectionId } = await params;

  const membership = await getClassMembership(classId, user.id);
  if (!membership) notFound();

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, classId },
    include: {
      class: { select: { name: true } },
      contributions: {
        orderBy: { user: { name: "asc" } },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!collection) notFound();

  const isCommittee = membership.role === "COMMITTEE";
  const baseUrl = process.env.APP_BASE_URL ?? "";
  const reportPath = `/report/${collection.publicReportCode}`;
  const reportUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}${reportPath}` : reportPath;

  const contributions = collection.contributions.map((c) => ({
    id: c.id,
    userId: c.user.id,
    name: c.user.name,
    isGuest: isGuestEmail(c.user.email),
    isPaid: c.isPaid,
    markedByParent: c.markedByParent,
    receiptUrl: c.receiptUrl,
    paidAt: c.paidAt?.toISOString() ?? null,
    comment: c.comment,
  }));

  return (
    <main className="flex flex-1 flex-col gap-6">
      <Link href={`/classes/${classId}`} className="text-sm text-stone-500 hover:text-brandDark">
        ← {collection.class.name}
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{collection.title}</h1>
        <p className="mt-1 text-sm text-stone-600">
          Взнос {formatRub(collection.amountCents)} с каждого родителя
        </p>
        {collection.description ? <p className="mt-2 text-sm text-stone-600">{collection.description}</p> : null}
      </div>

      <CollectionPanel
        classId={classId}
        collectionId={collectionId}
        isCommittee={isCommittee}
        currentUserId={user.id}
        reportUrl={reportUrl}
        exportUrl={`/api/classes/${classId}/export?collectionId=${collectionId}`}
        contributions={contributions}
      />
    </main>
  );
}

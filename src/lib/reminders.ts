import { formatRub } from "@/lib/money";

type UnpaidPerson = { name: string };

export function buildCollectionReminderMessage(input: {
  className: string;
  collectionTitle: string;
  amountCents: number;
  unpaid: UnpaidPerson[];
  reportUrl: string;
  deadline?: Date | null;
}) {
  const amount = formatRub(input.amountCents);
  const deadlineLine = input.deadline
    ? ` Срок: ${input.deadline.toLocaleDateString("ru-RU")}.`
    : "";
  const unpaidNames =
    input.unpaid.length === 0
      ? "Все уже сдали — спасибо!"
      : `Не сдали (${input.unpaid.length}): ${input.unpaid.map((u) => u.name).join(", ")}.`;

  return [
    `Напоминание — класс ${input.className}, сбор «${input.collectionTitle}».`,
    `Взнос: ${amount}.${deadlineLine}`,
    unpaidNames,
    `Отчёт: ${input.reportUrl}`,
    "КлассКасса · переводите сами, в сервисе прикрепите чек.",
  ].join("\n");
}

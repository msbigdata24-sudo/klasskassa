/**
 * Реквизиты оператора персональных данных и стороны Пользовательского соглашения.
 *
 * ВАЖНО: значения с префиксом `[ЗАПОЛНИТЬ:` — это заглушки для бета-периода.
 * Перед публичным релизом и переносом БД в РФ обязательно подставить реальные
 * данные ИП. Поиск по строке "ЗАПОЛНИТЬ" в репозитории покажет все места.
 */

export const LEGAL_DOCS_VERSION = "0.1 (бета)";
export const LEGAL_DOCS_EFFECTIVE_DATE = "8 мая 2026 г.";

export const OPERATOR = {
  legalForm: "Индивидуальный предприниматель",
  legalFormShort: "ИП",
  fullName: "[ЗАПОЛНИТЬ: ФИО ИП]",
  inn: "[ЗАПОЛНИТЬ: ИНН]",
  ogrnip: "[ЗАПОЛНИТЬ: ОГРНИП]",
  postalAddress: "[ЗАПОЛНИТЬ: адрес для корреспонденции]",

  contactEmail: "msbigdata24@gmail.com",
  telegramBetaInvite: "https://t.me/+4BGnWku5lJBkN2U6",
  telegramBetaTitle: "Апельсин — бета-тестирование",

  /** Текущее физическое размещение БД (бета-период). */
  dbHostingNote:
    "На бета-этапе база данных размещается на инфраструктуре зарубежного облачного провайдера (Render). До публичного релиза планируется перенос на инфраструктуру в Российской Федерации.",
} as const;

export function operatorIntroLine(): string {
  return `${OPERATOR.legalFormShort} ${OPERATOR.fullName} (ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip})`;
}

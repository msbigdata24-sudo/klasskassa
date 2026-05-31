/**
 * Реквизиты оператора персональных данных и стороны Пользовательского соглашения.
 *
 * На этапе беты реквизиты ИП могут быть не заполнены — см. LEGAL_BETA_DISCLOSURE.
 * Перед выходом из беты подставить fullName, inn, ogrnip, postalAddress.
 */

export const LEGAL_DOCS_VERSION = "0.2 (бета)";
export const LEGAL_DOCS_EFFECTIVE_DATE = "31 мая 2026 г.";

export const SERVICE_NAME = "КлассКасса";

export const LEGAL_BETA_DISCLOSURE =
  "На этапе открытой беты (до регистрации ИП и публикации реквизитов) оператором персональных данных выступает разработчик сервиса «КлассКасса». Официальные обращения принимаются по email и Telegram (см. раздел «Контакты»). Реквизиты ИП будут опубликованы в документах до выхода из беты в публичный релиз.";

export const OPERATOR = {
  legalForm: "Индивидуальный предприниматель",
  legalFormShort: "ИП",
  /** Заполнить до выхода из беты. Пока — см. LEGAL_BETA_DISCLOSURE. */
  fullName: "[ЗАПОЛНИТЬ: ФИО ИП]",
  inn: "[ЗАПОЛНИТЬ: ИНН]",
  ogrnip: "[ЗАПОЛНИТЬ: ОГРНИП]",
  /** До регистрации ИП — официальная переписка по email (с темой «ПДн»). */
  postalAddress:
    "До указания почтового адреса ИП: официальная корреспонденция на email (см. ниже), тема «ПДн» или «КлассКасса»",

  contactEmail: "msbigdata24@gmail.com",
  telegramBetaInvite: "https://t.me/Klasskassabot",
  telegramBetaTitle: "@Klasskassabot",

  /** Текущее физическое размещение БД (бета-период). */
  dbHostingNote:
    "На бета-этапе база данных размещается на инфраструктуре зарубежного облачного провайдера (Render, США/ЕС). До публичного релиза планируется перенос на инфраструктуру в Российской Федерации.",

  backupNote:
    "На бета-этапе резервное копирование базы данных выполняется средствами хостинг-провайдера Render PostgreSQL (автоматические снимки). Пользователям рекомендуется самостоятельно сохранять важные чеки и выгрузки Excel.",
} as const;

export function operatorHasPlaceholderRequisites(): boolean {
  return OPERATOR.fullName.includes("[ЗАПОЛНИТЬ");
}

export function operatorIntroLine(): string {
  if (operatorHasPlaceholderRequisites()) {
    return LEGAL_BETA_DISCLOSURE;
  }
  return `${OPERATOR.legalFormShort} ${OPERATOR.fullName} (ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip})`;
}

export function operatorRequisitesLine(): string {
  if (operatorHasPlaceholderRequisites()) {
    return "Реквизиты ИП будут опубликованы до выхода из беты.";
  }
  return `${OPERATOR.legalFormShort} ${OPERATOR.fullName}, ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip}, адрес: ${OPERATOR.postalAddress}`;
}

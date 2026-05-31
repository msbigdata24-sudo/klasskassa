import Link from "next/link";
import {
  LEGAL_DOCS_EFFECTIVE_DATE,
  LEGAL_DOCS_VERSION,
  OPERATOR,
  SERVICE_NAME,
  operatorIntroLine,
  operatorRequisitesLine,
} from "@/lib/legal-operator";
import { PUBLIC_REPORT_TTL_DAYS } from "@/lib/public-report";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { RECEIPT_RETENTION_DAYS } from "@/lib/receipts";

export const metadata = {
  title: `Политика конфиденциальности — ${SERVICE_NAME}`,
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold text-stone-900">Политика конфиденциальности</h1>
      <p className="text-xs text-stone-500">
        Версия {LEGAL_DOCS_VERSION}. Действует с {LEGAL_DOCS_EFFECTIVE_DATE}.
      </p>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">1. Общие положения</h2>
        <p className="mt-2">
          Настоящая Политика описывает порядок обработки персональных данных пользователей сервиса «{SERVICE_NAME}»
          (далее — «Сервис»). Политика составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О
          персональных данных».
        </p>
        <p className="mt-2">Оператор персональных данных: {operatorIntroLine()}</p>
        <p className="mt-2">{operatorRequisitesLine()}</p>
        <p className="mt-2">
          Регистрируясь и используя Сервис, вы подтверждаете ознакомление с Политикой и даёте согласие на обработку
          персональных данных на изложенных условиях, включая трансграничную передачу на бета-этапе (раздел 7).
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">2. Какие данные мы обрабатываем</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>учётные данные: email, имя (как вас называть), хеш пароля (сам пароль не хранится);</li>
          <li>данные класса: название класса, роль (родком / родитель), список участников;</li>
          <li>данные сборов: название, сумма, срок, статус оплаты по каждому родителю;</li>
          <li>
            фото и PDF чеков об оплате — только для подтверждения взноса; хранятся в зашифрованном канале (HTTPS) и в
            базе данных провайдера;
          </li>
          <li>имена в публичном отчёте по сбору — если родком включил ссылку для чата;</li>
          <li>служебные данные: cookie сессии, IP-адрес, журнал событий безопасности и поддержки.</li>
        </ul>
        <p className="mt-2">
          Сервис <strong>не принимает</strong> школьные деньги и не хранит реквизиты банковских карт.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">3. Цели обработки</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>регистрация и вход в Сервис;</li>
          <li>учёт родительских взносов и формирование отчётов для чата класса;</li>
          <li>защита от несанкционированного доступа и злоупотреблений;</li>
          <li>техническая поддержка и улучшение Сервиса;</li>
          <li>исполнение требований законодательства РФ.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">4. Правовые основания</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>согласие пользователя при регистрации (ст. 6 ч. 1 п. 1 152-ФЗ);</li>
          <li>исполнение Пользовательского соглашения (ст. 6 ч. 1 п. 5);</li>
          <li>законные интересы оператора в обеспечении безопасности Сервиса.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">5. Сроки хранения</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>учётные данные и данные классов — пока существует аккаунт;</li>
          <li>
            файлы чеков — {RECEIPT_RETENTION_DAYS} дней с момента загрузки, затем содержимое удаляется (статус оплаты
            может сохраниться);
          </li>
          <li>
            публичные ссылки отчётов — до {PUBLIC_REPORT_TTL_DAYS} дней с создания сбора или до отключения/обновления
            родкомом;
          </li>
          <li>журналы событий — до 12 месяцев.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">6. Передача третьим лицам</h2>
        <p className="mt-2">
          Данные могут обрабатываться хостинг-провайдером (Render) и сервисом доставки email (если включён сброс пароля).
          Мы не продаём персональные данные. Публичный отчёт по ссылке виден любому, у кого есть ссылка — родком
          самостоятельно решает, кому её отправлять.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">7. Размещение БД и трансграничная передача</h2>
        <p className="mt-2">{OPERATOR.dbHostingNote}</p>
        <p className="mt-2">
          Регистрируясь на бета-этапе, вы даёте информированное согласие на трансграничную передачу персональных данных
          в объёме, необходимом для работы Сервиса. После переноса инфраструктуры в РФ Политика будет обновлена.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">8. Cookie и сессии</h2>
        <p className="mt-2">
          Сервис использует строго необходимую cookie сессии (JWT в httpOnly-cookie) для входа. Без неё работа
          невозможна. Рекламные и сторонние аналитические cookie на бета-этапе не используются.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">9. Безопасность</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>HTTPS для всех соединений;</li>
          <li>пароли хранятся в виде bcrypt-хеша; минимальная длина пароля — {PASSWORD_MIN_LENGTH} символов ({PASSWORD_HINT});</li>
          <li>
            загрузка чеков: проверка типа и содержимого файла (magic bytes), ограничение размера, сжатие изображений;
            антивирусная проверка на стороне сервера не выполняется — загружайте только свои чеки;
          </li>
          <li>ограничение частоты запросов к публичным отчётам;</li>
          <li>родком может отключить или обновить публичную ссылку отчёта.</li>
        </ul>
        <p className="mt-2">{OPERATOR.backupNote}</p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">10. Права пользователя</h2>
        <p className="mt-2">
          Вы вправе запросить сведения об обработке, исправление данных, отзыв согласия и удаление аккаунта — через email{" "}
          <a href={`mailto:${OPERATOR.contactEmail}`} className="text-brand underline">
            {OPERATOR.contactEmail}
          </a>{" "}
          (тема «ПДн») или Telegram{" "}
          <a href={OPERATOR.telegramBetaInvite} className="text-brand underline" target="_blank" rel="noopener noreferrer">
            {OPERATOR.telegramBetaTitle}
          </a>
          . Жалоба — в Роскомнадзор или суд.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">11. Удаление аккаунта</h2>
        <p className="mt-2">
          Запрос на удаление направьте на {OPERATOR.contactEmail}. Данные удаляются в разумный срок, за исключением
          записей, которые должны храниться по закону. Записи о сборах в классе могут остаться обезличенными для
          целостности отчётов других родителей.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">12. Изменения Политики</h2>
        <p className="mt-2">
          Актуальная версия —{" "}
          <Link href="/privacy" className="text-brand underline">
            /privacy
          </Link>
          . Существенные изменения доводим через email или баннер в Сервисе.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">13. Контакты</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>email: {OPERATOR.contactEmail}</li>
          <li>Telegram: {OPERATOR.telegramBetaTitle}</li>
          <li>почтовый адрес / корреспонденция: {OPERATOR.postalAddress}</li>
        </ul>
      </section>
    </main>
  );
}

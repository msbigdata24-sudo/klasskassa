import Link from "next/link";
import { LEGAL_DOCS_EFFECTIVE_DATE, LEGAL_DOCS_VERSION, OPERATOR, operatorIntroLine } from "@/lib/legal-operator";

export const metadata = {
  title: "Политика конфиденциальности — Апельсин",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold text-stone-900">Политика конфиденциальности</h1>
      <p className="text-xs text-stone-500">
        Версия {LEGAL_DOCS_VERSION}. Действует с {LEGAL_DOCS_EFFECTIVE_DATE}.
      </p>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">1. Общие положения</h2>
        <p className="mt-2">
          Настоящая Политика конфиденциальности (далее — «Политика») описывает порядок обработки персональных данных
          пользователей сервиса «Апельсин» (далее — «Сервис»). Политика составлена в соответствии с Федеральным законом
          от 27.07.2006 № 152-ФЗ «О персональных данных» (далее — «Закон 152-ФЗ»).
        </p>
        <p className="mt-2">
          Оператором персональных данных является {operatorIntroLine()} (далее — «Оператор»).
        </p>
        <p className="mt-2">
          Используя Сервис и/или регистрируя аккаунт, пользователь подтверждает, что ознакомлен с Политикой и даёт
          согласие на обработку персональных данных на условиях, описанных ниже.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">2. Какие данные мы собираем</h2>
        <p className="mt-2">Оператор обрабатывает следующие категории данных пользователей:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>учётные данные: адрес электронной почты, имя, хеш пароля;</li>
          <li>данные о финансовой активности внутри групп: суммы расходов, участники, кто платил, кому должен, погашения, заметки к расходам;</li>
          <li>содержание сообщений: текстовые и голосовые сообщения в групповых чатах и личных сообщениях между участниками;</li>
          <li>служебные данные: токены сессий, push-токены устройств, IP-адрес, параметры устройства и браузера;</li>
          <li>настройки уведомлений (email, push) и настройки видимости групп;</li>
          <li>данные о действиях в Сервисе (журнал событий: вход, регистрация, операции с расходами и долгами) — для безопасности и внутренних метрик;</li>
          <li>при использовании платных функций — данные, необходимые платёжному сервису для проведения платежа (передаются напрямую платёжному провайдеру; реквизиты карт Оператор не хранит).</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">3. Цели обработки</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>создание и поддержание учётной записи пользователя;</li>
          <li>предоставление функциональности Сервиса: учёт совместных расходов, расчёт балансов, обмен сообщениями;</li>
          <li>обеспечение безопасности (защита от несанкционированного доступа, расследование инцидентов);</li>
          <li>отправка сервисных уведомлений (по email и push) в соответствии с настройками пользователя;</li>
          <li>информирование о существенных изменениях в Сервисе и в условиях его использования;</li>
          <li>анализ использования Сервиса в обезличенном виде для улучшения продукта;</li>
          <li>исполнение требований законодательства Российской Федерации.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">4. Правовые основания</h2>
        <p className="mt-2">Обработка персональных данных осуществляется на следующих основаниях:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>согласие пользователя, предоставленное при регистрации в Сервисе (ст. 6 ч. 1 п. 1 Закона 152-ФЗ);</li>
          <li>исполнение договора (Пользовательского соглашения), стороной которого является пользователь (ст. 6 ч. 1 п. 5);</li>
          <li>исполнение обязанностей, возложенных законодательством Российской Федерации.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">5. Способы и сроки обработки</h2>
        <p className="mt-2">
          Обработка осуществляется как с использованием средств автоматизации, так и без них (на стороне Оператора —
          только средствами автоматизации). Доступ к данным ограничен и предоставляется только лицам, выполняющим
          задачи, прямо связанные с поддержкой и развитием Сервиса.
        </p>
        <p className="mt-2">
          Сроки хранения:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>учётные данные и данные о финансовой активности — на протяжении срока существования аккаунта пользователя;</li>
          <li>сообщения — до удаления аккаунта пользователем или до удаления соответствующей группы;</li>
          <li>журналы событий — до 12 месяцев с момента события (для целей безопасности);</li>
          <li>служебные cookie и токены сессий — на срок действия сессии или до явного выхода пользователя.</li>
        </ul>
        <p className="mt-2">
          После удаления аккаунта личные сведения пользователя (email, имя, переписка, push-подписки, настройки
          уведомлений) удаляются. Записи о финансовой активности в группах, в которых участвовал пользователь, могут
          быть сохранены в обезличенном виде («Удалённый пользователь») для сохранения целостности взаиморасчётов
          между остальными участниками таких групп.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">6. Передача данных третьим лицам</h2>
        <p className="mt-2">
          Оператор не передаёт персональные данные третьим лицам, кроме как:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            поставщикам инфраструктуры (хостинг, доставка email, push-уведомления) — в объёме, необходимом для работы
            соответствующих функций;
          </li>
          <li>
            платёжным провайдерам (например, ЮKassa) — при оплате тарифа Pro или подарочной подписки. Платёжные данные
            (реквизиты карт, СБП) пользователь вводит напрямую на стороне платёжного сервиса; Оператор их не получает и
            не хранит;
          </li>
          <li>уполномоченным государственным органам — по основаниям и в порядке, предусмотренным законодательством.</li>
        </ul>
        <p className="mt-2">
          Оператор не продаёт данные пользователей и не использует их для рекламных рассылок третьих лиц.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">7. Размещение базы данных и трансграничная передача</h2>
        <p className="mt-2">{OPERATOR.dbHostingNote}</p>
        <p className="mt-2">
          На указанном этапе данные пользователей могут обрабатываться на серверах за пределами Российской Федерации.
          Регистрируясь в Сервисе на бета-этапе, пользователь даёт информированное согласие на трансграничную передачу
          персональных данных в страну, обеспечивающую адекватную защиту прав субъектов персональных данных, в объёме,
          необходимом для работы Сервиса.
        </p>
        <p className="mt-2">
          После переноса инфраструктуры в Российскую Федерацию Политика будет обновлена, а пользователи —
          проинформированы о смене места обработки.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">8. Cookie и аналогичные технологии</h2>
        <p className="mt-2">
          Сервис использует строго необходимые cookie и технологии локального хранения для поддержания сессии
          пользователя, корректной работы офлайн-режима и сохранения пользовательских настроек интерфейса. Без них
          Сервис не сможет работать.
        </p>
        <p className="mt-2">
          На бета-этапе сторонние рекламные и аналитические системы, передающие данные третьим лицам, в Сервисе не
          используются.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">9. Права пользователя</h2>
        <p className="mt-2">В соответствии со ст. 14, 15 и 21 Закона 152-ФЗ пользователь имеет право:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>получать сведения о составе и целях обработки своих персональных данных;</li>
          <li>требовать уточнения, исправления или блокирования данных в случае их неточности;</li>
          <li>отозвать согласие на обработку и потребовать удаления данных (см. раздел 10);</li>
          <li>обжаловать действия Оператора в уполномоченный орган по защите прав субъектов персональных данных
            (Роскомнадзор) или в суд.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">10. Удаление аккаунта и отзыв согласия</h2>
        <p className="mt-2">
          Отозвать согласие на обработку персональных данных пользователь может одним из следующих способов:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>самостоятельно удалить аккаунт в личном кабинете Сервиса (раздел «Личные → Удалить аккаунт»);</li>
          <li>направить запрос на адрес электронной почты Оператора:{" "}
            <a href={`mailto:${OPERATOR.contactEmail}`} className="text-rind underline hover:text-peel">
              {OPERATOR.contactEmail}
            </a>
            .
          </li>
        </ul>
        <p className="mt-2">
          После удаления аккаунта Оператор удаляет персональные данные пользователя в срок, не превышающий 30 дней,
          за исключением данных, которые в силу закона должны храниться дольше, и обезличенных записей о финансовой
          активности в группах, сохраняемых для целостности расчётов остальных участников этих групп.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">11. Защита данных</h2>
        <p className="mt-2">
          Оператор применяет необходимые технические и организационные меры для защиты персональных данных от
          неправомерного доступа, изменения, раскрытия и уничтожения: шифрование канала связи (HTTPS), хеширование
          паролей, ограничение доступа к данным, журналирование событий безопасности, регулярное обновление
          инфраструктурных компонентов.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">12. Изменения Политики</h2>
        <p className="mt-2">
          Оператор вправе обновлять Политику. Актуальная редакция всегда доступна по адресу{" "}
          <Link href="/privacy" className="text-rind underline hover:text-peel">/privacy</Link>. Существенные изменения
          доводятся до пользователей дополнительно (через email или баннер в Сервисе).
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">13. Контакты</h2>
        <p className="mt-2">
          По вопросам обработки персональных данных, для получения сведений о составе обрабатываемых данных и для
          подачи запросов на удаление обращайтесь:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            email:{" "}
            <a href={`mailto:${OPERATOR.contactEmail}`} className="text-rind underline hover:text-peel">
              {OPERATOR.contactEmail}
            </a>
          </li>
          <li>
            Telegram:{" "}
            <a href={OPERATOR.telegramBetaInvite} target="_blank" rel="noopener noreferrer" className="text-rind underline hover:text-peel">
              {OPERATOR.telegramBetaTitle}
            </a>
          </li>
          <li>почтовый адрес: {OPERATOR.postalAddress}</li>
        </ul>
      </section>
    </main>
  );
}

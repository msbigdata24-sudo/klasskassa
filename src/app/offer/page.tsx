import Link from "next/link";
import { LEGAL_DOCS_EFFECTIVE_DATE, LEGAL_DOCS_VERSION, OPERATOR, operatorIntroLine } from "@/lib/legal-operator";

export const metadata = {
  title: "Пользовательское соглашение — Апельсин",
};

export default function OfferPage() {
  return (
    <main className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold text-stone-900">Пользовательское соглашение</h1>
      <p className="text-xs text-stone-500">
        Версия {LEGAL_DOCS_VERSION}. Действует с {LEGAL_DOCS_EFFECTIVE_DATE}.
      </p>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">1. Общие положения</h2>
        <p className="mt-2">
          Настоящее Пользовательское соглашение (далее — «Соглашение») является публичной офертой и регулирует отношения
          между {operatorIntroLine()} (далее — «Оператор», «мы») и физическим лицом (далее — «Пользователь», «вы»),
          использующим сервис «Апельсин» (далее — «Сервис»).
        </p>
        <p className="mt-2">
          Регистрируясь в Сервисе и/или используя его, Пользователь подтверждает, что ознакомился с Соглашением и{" "}
          <Link href="/privacy" className="text-rind underline hover:text-peel">Политикой конфиденциальности</Link>,
          согласен с их условиями и обязуется их соблюдать.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">2. Предмет</h2>
        <p className="mt-2">
          Сервис предоставляет Пользователю инструменты для учёта совместных расходов в группах:
          фиксация трат, разделение долей между участниками, расчёт балансов и плана взаиморасчётов, обмен сообщениями
          в рамках группы, экспорт данных, дополнительные функции по подписке Pro.
        </p>
        <p className="mt-2 font-semibold text-stone-900">
          Сервис не является платёжной системой, кредитной организацией или электронным кошельком.
        </p>
        <p className="mt-2">
          Все денежные переводы между Пользователями осуществляются ими самостоятельно, привычными им способами
          (СБП, банковский перевод, наличные и пр.). Оператор не хранит денежные средства Пользователей, не выступает
          посредником в расчётах и не несёт ответственности за фактическое перечисление сумм между ними.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">3. Бета-этап</h2>
        <p className="mt-2">
          Сервис на момент действия настоящей редакции Соглашения работает в режиме открытого бета-тестирования.
          Это означает, что:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>функциональность Сервиса может изменяться без предварительного уведомления;</li>
          <li>возможны кратковременные перебои, ошибки в расчётах и потеря части данных;</li>
          <li>Оператор не предоставляет гарантий бесперебойной работы и сохранности данных в объёме, превышающем
            разумно ожидаемый для бесплатного публичного бета-сервиса;</li>
          <li>отдельные функции могут быть выключены, ограничены или удалены без компенсации.</li>
        </ul>
        <p className="mt-2">
          Используя Сервис на бета-этапе, Пользователь принимает указанные риски.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">4. Регистрация и аккаунт</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Самостоятельная регистрация в Сервисе доступна лицам, достигшим 14 лет. Лица младше 14 лет могут участвовать
            в учёте общих расходов в качестве участника группы, добавленного зарегистрированным взрослым (родителем,
            опекуном) — без создания отдельной учётной записи.
          </li>
          <li>Пользователь самостоятельно отвечает за достоверность данных, указанных при регистрации.</li>
          <li>Пользователь обязуется не передавать учётные данные третьим лицам и принимает на себя ответственность за
            все действия, совершённые под его аккаунтом.</li>
          <li>В случае подозрения на компрометацию аккаунта Пользователь обязан сменить пароль и сообщить Оператору.</li>
          <li>
            Взрослый Пользователь, добавляющий несовершеннолетнего как участника группы, гарантирует, что обладает
            полномочиями законного представителя такого лица, и принимает на себя ответственность за обработку
            персональных данных этого участника в объёме, указанном в группе (имя, доли расходов).
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">5. Использование Сервиса</h2>
        <p className="mt-2">При использовании Сервиса Пользователь обязуется:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>не нарушать законодательство Российской Федерации, права и интересы третьих лиц;</li>
          <li>не размещать в чатах и заметках материалы, нарушающие закон, оскорбляющие участников, содержащие
            мошеннические схемы, спам, угрозы, экстремистские и иные запрещённые сведения;</li>
          <li>не пытаться получить несанкционированный доступ к чужим аккаунтам, группам или инфраструктуре Сервиса;</li>
          <li>не использовать автоматизированные средства массового создания аккаунтов и нагрузки на Сервис.</li>
        </ul>
        <p className="mt-2">
          Оператор вправе ограничить или прекратить доступ Пользователя к Сервису при выявлении нарушений настоящего
          раздела, без возврата какой-либо платы.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">6. Платные функции (Pro)</h2>
        <p className="mt-2">
          Часть функций Сервиса может предоставляться по подписке «Апельсин Pro» либо по разовым платежам (например,
          подарочные подписки). Стоимость, состав возможностей и срок действия указываются на странице{" "}
          <Link href="/pricing" className="text-rind underline hover:text-peel">/pricing</Link> и в карточке оплаты в
          момент оформления.
        </p>
        <p className="mt-2">
          Оплата производится через стороннего платёжного провайдера. Возврат средств производится в случаях и порядке,
          предусмотренных законодательством Российской Федерации; для возврата следует обратиться в адрес Оператора.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">7. Интеллектуальная собственность</h2>
        <p className="mt-2">
          Все исключительные права на Сервис, его дизайн, программный код, тексты, графику и иные материалы принадлежат
          Оператору либо его лицензиарам. Пользователь получает право использования Сервиса в пределах его штатной
          функциональности и не приобретает каких-либо прав на программный код или иные объекты Сервиса.
        </p>
        <p className="mt-2">
          Контент, размещаемый Пользователем (траты, заметки, сообщения), остаётся за Пользователем. Регистрируясь в
          Сервисе, Пользователь предоставляет Оператору ограниченное право обрабатывать такой контент в объёме, необходимом
          для предоставления функциональности Сервиса (хранение, отображение участникам группы, резервное копирование).
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">8. Ограничение ответственности</h2>
        <p className="mt-2">
          Сервис предоставляется на условиях «как есть» (as is). Оператор не гарантирует, что Сервис будет
          соответствовать всем ожиданиям Пользователя, что работа будет бесперебойной, а результаты вычислений —
          абсолютно точными во всех возможных сценариях использования.
        </p>
        <p className="mt-2">
          Оператор не несёт ответственности за:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>достоверность данных, внесённых Пользователями (сумм, участников, заметок);</li>
          <li>фактическое перечисление либо неперечисление денежных средств между Пользователями;</li>
          <li>конфликты и разногласия между участниками одной группы по поводу долей и расходов;</li>
          <li>действия третьих лиц, в том числе хостинг-провайдеров, платёжных систем, операторов связи;</li>
          <li>последствия использования Сервиса в нарушение настоящего Соглашения.</li>
        </ul>
        <p className="mt-2">
          Совокупный размер ответственности Оператора в любом случае не может превышать сумму, фактически уплаченную
          Пользователем за платные функции Сервиса за последние 12 месяцев. Для пользователей, не оплачивавших платные
          функции, ответственность Оператора ограничивается мерами, прямо предусмотренными императивными нормами
          законодательства.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">9. Прекращение использования</h2>
        <p className="mt-2">
          Пользователь вправе в любой момент прекратить использование Сервиса и удалить свой аккаунт через личный
          кабинет либо обратившись к Оператору. Порядок удаления данных описан в{" "}
          <Link href="/privacy#10" className="text-rind underline hover:text-peel">разделе 10 Политики конфиденциальности</Link>.
        </p>
        <p className="mt-2">
          Оператор вправе приостановить или прекратить предоставление Сервиса конкретному Пользователю, а равно прекратить
          работу Сервиса в целом, уведомив об этом разумно заблаговременно (через email или баннер в Сервисе), за
          исключением случаев нарушения Пользователем условий Соглашения, при которых уведомление может направляться
          одновременно с прекращением доступа.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">10. Персональные данные</h2>
        <p className="mt-2">
          Порядок обработки персональных данных описан в{" "}
          <Link href="/privacy" className="text-rind underline hover:text-peel">Политике конфиденциальности</Link>,
          являющейся неотъемлемой частью настоящего Соглашения.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">11. Изменение условий</h2>
        <p className="mt-2">
          Оператор вправе вносить изменения в Соглашение. Актуальная редакция всегда доступна по адресу{" "}
          <Link href="/offer" className="text-rind underline hover:text-peel">/offer</Link>. Существенные изменения
          доводятся до Пользователей дополнительно. Продолжение использования Сервиса после публикации новой редакции
          считается согласием с её условиями.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">12. Применимое право и разрешение споров</h2>
        <p className="mt-2">
          К Соглашению применяется право Российской Федерации. Споры, не урегулированные путём переписки и переговоров,
          подлежат рассмотрению в суде по месту нахождения Оператора, если иное прямо не предусмотрено императивными
          нормами законодательства о защите прав потребителей.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">13. Контакты</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{operatorIntroLine()}</li>
          <li>почтовый адрес: {OPERATOR.postalAddress}</li>
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
        </ul>
      </section>
    </main>
  );
}

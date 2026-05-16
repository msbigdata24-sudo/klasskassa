/** Дней без подтверждённого погашения по паре должник→кредитор — после чего шлём мягкое напоминание должнику. */
export const DEBT_REMINDER_STALE_DAYS = 5;

/** Не чаще одного авто-напоминания на ту же пару в группе (дней). */
export const DEBT_REMINDER_COOLDOWN_DAYS = 5;

/** Не напоминать о «пылинках» (копейки). */
export const DEBT_REMINDER_MIN_CENTS = 100;

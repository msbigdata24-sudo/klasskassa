/** Минимальное серверное логирование критических ошибок (Render Logs / будущий алертинг). */
export function logServerError(scope: string, error: unknown, context?: Record<string, unknown>) {
  const payload = {
    scope,
    at: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };
  console.error("[klasskassa]", JSON.stringify(payload));
}

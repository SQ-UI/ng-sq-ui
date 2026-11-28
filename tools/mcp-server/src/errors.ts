export class UiError extends Error {
  constructor(readonly code: string, message: string, readonly details?: unknown) { super(message); }
}
export function requireValue<T>(value: T | undefined, code: string, message: string): T {
  if (value === undefined) throw new UiError(code, message);
  return value;
}
export function errorResult(error: unknown) {
  return { ok: false as const, error: { code: error instanceof UiError ? error.code : 'INTERNAL_ERROR', message: error instanceof Error ? error.message : String(error), ...(error instanceof UiError && error.details !== undefined ? { details: error.details } : {}) } };
}

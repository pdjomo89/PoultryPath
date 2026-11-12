import { ConvexError } from 'convex/values';

export type FieldErrors = Record<string, string>;

interface ErrorData {
  message?: string;
  fields?: FieldErrors;
  code?: string;
}

const dataOf = (err: unknown): ErrorData =>
  err instanceof ConvexError && typeof err.data === 'object' && err.data ? (err.data as ErrorData) : {};

/** Per-field messages sent back by the server's validation (convex/lib.ts). */
export const fieldErrors = (err: unknown): FieldErrors => dataOf(err).fields ?? {};

export const isUnauthorized = (err: unknown) => dataOf(err).code === 'UNAUTHORIZED';

const FALLBACK = {
  genericError: 'Something went wrong. Please try again.',
  networkError: 'We couldn’t reach the server. Check your connection and try again.',
};

/**
 * User-facing message for a failed call. Server validation messages already
 * arrive in the visitor's language; pass `t.common` for translated fallbacks.
 */
export function errorMessage(err: unknown, fallback: typeof FALLBACK = FALLBACK): string {
  const { message } = dataOf(err);
  if (message) return message;
  if (err instanceof Error && /network|fetch|connection/i.test(err.message)) return fallback.networkError;
  return fallback.genericError;
}

/** Reads the hidden honeypot field rendered by <Honeypot />. */
export const readHoneypot = (form: HTMLFormElement) =>
  (form.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';

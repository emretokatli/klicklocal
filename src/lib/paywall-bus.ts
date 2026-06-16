/**
 * Tiny module-level bridge so the (React-less) axios interceptor can open the
 * paywall modal that lives in React state. The PaywallProvider registers its
 * `open` callback here on mount; the api-client calls `emitPaywall()` on any 402.
 *
 * Reason is an optional free-text key (e.g. 'publish', 'ai') the modal uses to
 * tailor its headline. A 402 with no known reason falls back to a generic one.
 */
export type PaywallReason = 'publish' | 'ai' | 'media' | 'default';

type PaywallHandler = (reason?: PaywallReason) => void;

let handler: PaywallHandler | null = null;

export function setPaywallHandler(next: PaywallHandler | null): void {
  handler = next;
}

export function emitPaywall(reason?: PaywallReason): void {
  handler?.(reason);
}

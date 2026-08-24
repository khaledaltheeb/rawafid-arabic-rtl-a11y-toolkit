export type LivePoliteness = 'polite' | 'assertive';

export type AnnounceOptions = {
  politeness?: LivePoliteness;
  clearAfterMs?: number;
  documentRef?: Document;
};

function applyVisuallyHiddenStyle(element: HTMLElement): void {
  Object.assign(element.style, {
    position: 'absolute',
    inlineSize: '1px',
    blockSize: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: '0',
  });
}

/**
 * Announce plain text through a temporary ARIA live region. The function is
 * SSR-safe and returns an idempotent cleanup function. It never accepts HTML.
 */
export function announce(message: string, options: AnnounceOptions = {}): () => void {
  const politeness = options.politeness ?? 'polite';
  const clearAfterMs = options.clearAfterMs ?? 4000;
  if (!Number.isFinite(clearAfterMs) || clearAfterMs < 0) {
    throw new RangeError('clearAfterMs must be a finite non-negative number.');
  }

  const documentRef = options.documentRef ?? globalThis.document;
  if (!documentRef?.body) return () => undefined;

  const region = documentRef.createElement('div');
  region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('aria-relevant', 'additions text');
  region.className = 'rawafid-sr-only';
  applyVisuallyHiddenStyle(region);
  documentRef.body.append(region);

  const view = documentRef.defaultView;
  const setMessage = () => {
    if (region.isConnected) region.textContent = message;
  };

  let frame: number | undefined;
  if (view?.requestAnimationFrame) frame = view.requestAnimationFrame(setMessage);
  else setMessage();

  const timer = view?.setTimeout(() => region.remove(), clearAfterMs)
    ?? globalThis.setTimeout(() => region.remove(), clearAfterMs);

  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    if (frame !== undefined) view?.cancelAnimationFrame(frame);
    if (view) view.clearTimeout(timer);
    else globalThis.clearTimeout(timer);
    region.remove();
  };
}

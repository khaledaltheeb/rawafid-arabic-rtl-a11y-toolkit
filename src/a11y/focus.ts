const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isInHiddenSubtree(element: HTMLElement): boolean {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    if (current.hidden || current.getAttribute('aria-hidden') === 'true') return true;
    if (current.hasAttribute('inert')) return true;
  }
  return false;
}

function isActuallyFocusable(element: HTMLElement): boolean {
  if (isInHiddenSubtree(element)) return false;
  if (element.tabIndex < 0) return false;

  const view = element.ownerDocument.defaultView;
  const style = view?.getComputedStyle(element);
  if (style && (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')) {
    return false;
  }
  return true;
}

export function getFocusableElements(container: ParentNode): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isActuallyFocusable);
}

export function focusFirst(container: ParentNode): HTMLElement | undefined {
  const first = getFocusableElements(container)[0];
  first?.focus();
  return first;
}

/**
 * Capture the currently focused element and return a safe restoration callback.
 * In SSR/non-DOM runtimes the callback is a no-op.
 */
export function rememberFocus(documentRef?: Document): () => void {
  const doc = documentRef ?? globalThis.document;
  if (!doc) return () => undefined;

  const HTMLElementCtor = doc.defaultView?.HTMLElement;
  const active = HTMLElementCtor && doc.activeElement instanceof HTMLElementCtor
    ? doc.activeElement as HTMLElement
    : undefined;

  return () => {
    if (active?.isConnected) active.focus();
  };
}

export type DisclosureButtonAttributes = {
  type: 'button';
  'aria-expanded': boolean;
  'aria-controls'?: string;
};

export type MenuButtonAttributes = {
  type: 'button';
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls'?: string;
};

export type ModalDialogAttributes = {
  role: 'dialog';
  'aria-modal': true;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

export type ModalDialogAttributeOptions = {
  labelledBy?: string;
  label?: string;
  describedBy?: string;
};

function optionalToken(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

/**
 * Build framework-neutral attributes for a native disclosure button.
 * Native button keyboard behavior should be preserved by the consumer.
 */
export function disclosureButtonAttributes(
  expanded: boolean,
  controlsId?: string,
): DisclosureButtonAttributes {
  const attributes: DisclosureButtonAttributes = {
    type: 'button',
    'aria-expanded': expanded,
  };
  const controls = optionalToken(controlsId);
  if (controls) attributes['aria-controls'] = controls;
  return attributes;
}

/** Build the semantic state for a button that opens an ARIA menu. */
export function menuButtonAttributes(
  expanded: boolean,
  menuId?: string,
): MenuButtonAttributes {
  const attributes: MenuButtonAttributes = {
    type: 'button',
    'aria-haspopup': 'menu',
    'aria-expanded': expanded,
  };
  const controls = optionalToken(menuId);
  if (controls) attributes['aria-controls'] = controls;
  return attributes;
}

/**
 * Resolve the APG menu-button opening target. Arrow-key opening is optional in
 * APG, so consumers can disable it while retaining Enter/Space behavior.
 */
export function menuOpenTargetFromKey(
  key: string,
  includeArrowKeys = true,
): 'first' | 'last' | undefined {
  if (key === 'Enter' || key === ' ') return 'first';
  if (!includeArrowKeys) return undefined;
  if (key === 'ArrowDown') return 'first';
  if (key === 'ArrowUp') return 'last';
  return undefined;
}

/**
 * Build modal-dialog semantics without owning application lifecycle behavior.
 * Callers remain responsible for making outside content inert, moving initial
 * focus into the dialog, trapping Tab/Shift+Tab, Escape handling, and restoring
 * focus on close.
 */
export function modalDialogAttributes(
  options: ModalDialogAttributeOptions,
): ModalDialogAttributes {
  const labelledBy = optionalToken(options.labelledBy);
  const label = optionalToken(options.label);
  if (!labelledBy && !label) {
    throw new RangeError('A modal dialog requires labelledBy or label.');
  }

  const attributes: ModalDialogAttributes = {
    role: 'dialog',
    'aria-modal': true,
  };
  if (labelledBy) attributes['aria-labelledby'] = labelledBy;
  else if (label) attributes['aria-label'] = label;

  const describedBy = optionalToken(options.describedBy);
  if (describedBy) attributes['aria-describedby'] = describedBy;
  return attributes;
}

/**
 * Resolve a Tab/Shift+Tab destination within a contained sequence.
 * Returns -1 when the container has no tabbable items.
 */
export function nextContainedTabIndex(
  currentIndex: number,
  itemCount: number,
  shiftKey = false,
): number {
  if (!Number.isInteger(itemCount) || itemCount < 0) {
    throw new RangeError('itemCount must be a non-negative integer.');
  }
  if (itemCount === 0) return -1;
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= itemCount) {
    throw new RangeError(`currentIndex must be an integer between 0 and ${itemCount - 1}.`);
  }

  if (shiftKey) return currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
  return currentIndex === itemCount - 1 ? 0 : currentIndex + 1;
}

import { describe, expect, it } from 'vitest';
import {
  disclosureButtonAttributes,
  menuButtonAttributes,
  menuOpenTargetFromKey,
  modalDialogAttributes,
  nextContainedTabIndex,
} from '../../src/a11y/patterns';

describe('framework-neutral accessibility patterns', () => {
  it('builds disclosure semantics without inventing empty relationships', () => {
    expect(disclosureButtonAttributes(false, ' panel-a ')).toEqual({
      type: 'button',
      'aria-expanded': false,
      'aria-controls': 'panel-a',
    });
    expect(disclosureButtonAttributes(true, '   ')).toEqual({
      type: 'button',
      'aria-expanded': true,
    });
  });

  it('builds menu-button semantics and resolves supported opening keys', () => {
    expect(menuButtonAttributes(true, 'menu-a')).toEqual({
      type: 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': true,
      'aria-controls': 'menu-a',
    });
    expect(menuOpenTargetFromKey('Enter')).toBe('first');
    expect(menuOpenTargetFromKey(' ')).toBe('first');
    expect(menuOpenTargetFromKey('ArrowDown')).toBe('first');
    expect(menuOpenTargetFromKey('ArrowUp')).toBe('last');
    expect(menuOpenTargetFromKey('ArrowDown', false)).toBeUndefined();
    expect(menuOpenTargetFromKey('Escape')).toBeUndefined();
  });

  it('requires an accessible name for modal-dialog semantics', () => {
    expect(modalDialogAttributes({ labelledBy: 'dialog-title', describedBy: 'dialog-desc' })).toEqual({
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': 'dialog-title',
      'aria-describedby': 'dialog-desc',
    });
    expect(modalDialogAttributes({ label: 'Confirm action' })).toEqual({
      role: 'dialog',
      'aria-modal': true,
      'aria-label': 'Confirm action',
    });
    expect(() => modalDialogAttributes({ label: '   ' })).toThrow(RangeError);
  });

  it('wraps forward and reverse Tab destinations inside a contained sequence', () => {
    expect(nextContainedTabIndex(0, 3)).toBe(1);
    expect(nextContainedTabIndex(2, 3)).toBe(0);
    expect(nextContainedTabIndex(2, 3, true)).toBe(1);
    expect(nextContainedTabIndex(0, 3, true)).toBe(2);
    expect(nextContainedTabIndex(0, 0)).toBe(-1);
  });

  it('rejects invalid contained-tab indices and item counts', () => {
    expect(() => nextContainedTabIndex(0, -1)).toThrow(RangeError);
    expect(() => nextContainedTabIndex(3, 3)).toThrow(RangeError);
    expect(() => nextContainedTabIndex(0.5, 3)).toThrow(RangeError);
  });
});

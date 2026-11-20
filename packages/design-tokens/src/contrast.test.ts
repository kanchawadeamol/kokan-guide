import { describe, expect, it } from 'vitest';

import { contrastRatio, isHexColor, relativeLuminance } from './contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
  });

  it('accepts upper-case hex', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 10);
  });

  it.each(['#fff', 'ffffff', '#ffffffff', 'red', '#gggggg', ''])('rejects %j', (value) => {
    expect(() => relativeLuminance(value)).toThrow(TypeError);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#0b6e6e', '#0b6e6e')).toBe(1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#0b6e6e', '#ffffff')).toBe(contrastRatio('#ffffff', '#0b6e6e'));
  });

  it('matches published reference values', () => {
    // #767676 on white is the well-known lightest grey passing AA (4.54:1).
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
    // #777777 on white just fails AA (4.48:1).
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});

describe('isHexColor', () => {
  it('accepts only 6-digit hex with leading #', () => {
    expect(isHexColor('#a8401f')).toBe(true);
    expect(isHexColor('#a84')).toBe(false);
    expect(isHexColor('a8401f')).toBe(false);
  });
});

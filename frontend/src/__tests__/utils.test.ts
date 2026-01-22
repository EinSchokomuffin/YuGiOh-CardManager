import { formatPrice, getRarityColor, getConditionLabel, getEditionLabel, cn } from '../lib/utils';

describe('formatPrice', () => {
  it('formats price in EUR by default', () => {
    expect(formatPrice(25.5)).toBe('25,50 €');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0,00 €');
  });

  it('handles large numbers', () => {
    expect(formatPrice(1234.56)).toBe('1.234,56 €');
  });

  it('handles undefined', () => {
    expect(formatPrice(undefined as any)).toBe('0,00 €');
  });
});

describe('getRarityColor', () => {
  it('returns gold color for Ultra Rare', () => {
    expect(getRarityColor('Ultra Rare')).toBe('text-rarity-ultra');
  });

  it('returns gold color for Secret Rare', () => {
    expect(getRarityColor('Secret Rare')).toBe('text-rarity-secret');
  });

  it('returns green color for Super Rare', () => {
    expect(getRarityColor('Super Rare')).toBe('text-rarity-super');
  });

  it('returns blue color for Rare', () => {
    expect(getRarityColor('Rare')).toBe('text-rarity-rare');
  });

  it('returns default for Common', () => {
    expect(getRarityColor('Common')).toBe('text-muted-foreground');
  });

  it('handles unknown rarities', () => {
    expect(getRarityColor('Unknown')).toBe('text-muted-foreground');
  });
});

describe('getConditionLabel', () => {
  it('returns correct label for NEAR_MINT', () => {
    expect(getConditionLabel('NEAR_MINT')).toBe('Near Mint');
  });

  it('returns correct label for LIGHTLY_PLAYED', () => {
    expect(getConditionLabel('LIGHTLY_PLAYED')).toBe('Lightly Played');
  });

  it('returns correct label for MODERATELY_PLAYED', () => {
    expect(getConditionLabel('MODERATELY_PLAYED')).toBe('Moderately Played');
  });

  it('returns correct label for HEAVILY_PLAYED', () => {
    expect(getConditionLabel('HEAVILY_PLAYED')).toBe('Heavily Played');
  });

  it('returns correct label for DAMAGED', () => {
    expect(getConditionLabel('DAMAGED')).toBe('Damaged');
  });

  it('handles unknown conditions', () => {
    expect(getConditionLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('getEditionLabel', () => {
  it('returns correct label for FIRST_EDITION', () => {
    expect(getEditionLabel('FIRST_EDITION')).toBe('1st Edition');
  });

  it('returns correct label for UNLIMITED', () => {
    expect(getEditionLabel('UNLIMITED')).toBe('Unlimited');
  });

  it('returns correct label for LIMITED', () => {
    expect(getEditionLabel('LIMITED')).toBe('Limited Edition');
  });

  it('handles unknown editions', () => {
    expect(getEditionLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('cn (classnames utility)', () => {
  it('merges class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('merges Tailwind conflicting classes', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
  });

  it('handles arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });
});

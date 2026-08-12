import { describe, it, expect } from 'vitest';
import { formatCurrency, formatQAR } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats QAR amount in English correctly', () => {
    expect(formatQAR(1250.50)).toBe('QAR 1,250.50');
  });

  it('formats QAR amount in Arabic correctly', () => {
    const formatted = formatQAR(1250.50, true);
    expect(formatted).toContain('ر.ق');
  });
});

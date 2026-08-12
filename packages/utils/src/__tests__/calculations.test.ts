import { describe, it, expect } from 'vitest';
import { calculateLineTotals } from '../calculations';

describe('calculateLineTotals', () => {
  it('calculates line total without tax or discount', () => {
    const result = calculateLineTotals({ unitPrice: 10, quantity: 2 });
    expect(result.subtotal).toBe(20);
    expect(result.grandTotal).toBe(20);
  });

  it('calculates line total with discount and VAT tax', () => {
    const result = calculateLineTotals({ unitPrice: 100, quantity: 1, discount: 10, vatRate: 0.05 });
    expect(result.subtotal).toBe(100);
    expect(result.discountTotal).toBe(10);
    expect(result.netBeforeTax).toBe(90);
    expect(result.taxTotal).toBe(4.5);
    expect(result.grandTotal).toBe(94.5);
  });
});

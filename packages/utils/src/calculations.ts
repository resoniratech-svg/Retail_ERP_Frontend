export interface LineCalculationInput {
  unitPrice: number;
  quantity: number;
  discount?: number; // absolute amount in QAR
  vatRate?: number; // e.g. 0.0 or 0.05
}

export interface LineCalculationResult {
  subtotal: number;
  discountTotal: number;
  netBeforeTax: number;
  taxTotal: number;
  grandTotal: number;
}

export function calculateLineTotals(input: LineCalculationInput): LineCalculationResult {
  const { unitPrice, quantity, discount = 0, vatRate = 0 } = input;
  const subtotal = unitPrice * quantity;
  const discountTotal = Math.min(discount, subtotal);
  const netBeforeTax = subtotal - discountTotal;
  const taxTotal = netBeforeTax * vatRate;
  const grandTotal = netBeforeTax + taxTotal;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountTotal.toFixed(2)),
    netBeforeTax: Number(netBeforeTax.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

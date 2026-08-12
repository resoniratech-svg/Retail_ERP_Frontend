export function generateEAN13Barcode(): string {
  const prefix = '628'; // Saudi/GCC prefix standard
  const randomDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const base = prefix + randomDigits;
  
  // Calculate EAN-13 checksum digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + checkDigit;
}

export function isValidBarcode(barcode: string): boolean {
  return /^\d{8,14}$/.test(barcode.trim());
}

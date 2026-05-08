export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const absAmount = Math.abs(amount);
  
  // Simple formatting with currency symbol
  const symbols: Record<string, string> = {
    USD: '$',
    ZWL: 'Z$',
    ZAR: 'R',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbols[currency] || currency;
  
  // Format with 2 decimal places
  const formatted = absAmount.toFixed(2);
  
  return `${symbol}${formatted}`;
}

export function parseCurrencyInput(value: string): number {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

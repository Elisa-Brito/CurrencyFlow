export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatRate(value: number): string {
  return value.toFixed(4);
}

export function formatDate(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function getMonthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export function currencyFlag(currency: string): string {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    CHF: '🇨🇭',
  };
  return flags[currency] ?? '💱';
}

export function currencyName(currency: string): string {
  const names: Record<string, string> = {
    USD: 'Dólar Americano',
    EUR: 'Euro',
    GBP: 'Libra Esterlina',
    CAD: 'Dólar Canadense',
    AUD: 'Dólar Australiano',
    CHF: 'Franco Suíço',
  };
  return names[currency] ?? currency;
}

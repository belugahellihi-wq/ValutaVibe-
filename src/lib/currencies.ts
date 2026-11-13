export const currencies = [
  { code: 'USD', name: 'Доллар США', symbol: '$', color: '#80d6b0' },
  { code: 'EUR', name: 'Евро', symbol: '€', color: '#a2b5ff' },
  { code: 'KGS', name: 'Кыргызский сом', symbol: 'с', color: '#f4c57e' },
  { code: 'GBP', name: 'Фунт стерлингов', symbol: '£', color: '#d5acf9' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽', color: '#8ec8ef' },
  { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸', color: '#7fd9cf' },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥', color: '#eea0ac' },
  { code: 'JPY', name: 'Японская иена', symbol: '¥', color: '#f4b599' },
  { code: 'CHF', name: 'Швейцарский франк', symbol: '₣', color: '#dba2ba' },
] as const;
export type Currency = typeof currencies[number]['code'];
export const codes = currencies.map(c => c.code);
export const meta = (code: string) => currencies.find(c => c.code === code) ?? currencies[0];
export const format = (n: number, digits = 4) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: 2 }).format(n);
export const dateLabel = (date: string) => new Date(date + 'T12:00:00Z').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });

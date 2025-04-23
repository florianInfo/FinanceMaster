import { useCurrency } from '../contexts/CurrencyContext';

interface Props {
  amount: number;
  className?: string;
}

export default function Amount({ amount, className = '' }: Props) {
  const { currency } = useCurrency();

  const formatAmount = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getSymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'CAD': return 'CA$';
      default: return currency;
    }
  };

  const sign = amount < 0 ? '-' : amount > 0 ? '+' : '';

  return (
    <span className={`whitespace-nowrap ${className}`}>
      {sign} {formatAmount(Math.abs(amount))} {getSymbol(currency)}
    </span>
  );
}

import { useCurrency } from '../contexts/CurrencyContext';

interface Props {
  amount: number;
  className?: string;
}

export default function Amount({ amount, className = '' }: Props) {
  const { getCurrencySymbol } = useCurrency();

  const formatAmount = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sign = amount < 0 ? '-' : amount > 0 ? '+' : '';

  return (
    <span className={`whitespace-nowrap ${className}`}>
      {sign} {formatAmount(Math.abs(amount))} {getCurrencySymbol()}
    </span>
  );
}

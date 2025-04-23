import Amount from './Amount';

interface Props {
  amount: number;
}

export default function ColoredAmount({ amount }: Props) {
  const colorClass =
    amount < 0 ? 'text-red-600' : amount > 0 ? 'text-green-600' : 'text-gray-600';

  return <Amount amount={amount} className={colorClass} />;
}
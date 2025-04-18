import { useCurrency, SUPPORTED_CURRENCIES } from "../contexts/CurrencyContext";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Devise :</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
        className="border px-2 py-1 text-sm rounded bg-(--color-bg) cursor-pointer"
      >
        {SUPPORTED_CURRENCIES.map((cur) => (
          <option key={cur} value={cur}>
            {cur}
          </option>
        ))}
      </select>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: 'STX' | 'sBTC';
  label?: string;
  error?: string;
}

export function AmountInput({ 
  value, 
  onChange, 
  currency = 'STX',
  label = 'Amount',
  error 
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow numbers and decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  const convertToMicroUnits = (amount: string): number => {
    return Math.floor(parseFloat(amount || '0') * 1000000);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="amount">{label}</Label>
      <div className="relative">
        <Input
          id="amount"
          type="text"
          placeholder="0.00"
          value={value}
          onChange={handleChange}
          className={`pr-16 ${error ? 'border-red-500' : ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
          {currency}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {value && !error && (
        <p className="text-xs text-muted-foreground">
          = {convertToMicroUnits(value).toLocaleString()} micro{currency}
        </p>
      )}
    </div>
  );
}

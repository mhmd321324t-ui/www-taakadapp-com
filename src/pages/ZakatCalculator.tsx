import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export default function ZakatCalculator() {
  const { t } = useLocale();
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [stocks, setStocks] = useState('');
  const [debts, setDebts] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const total = (parseFloat(cash) || 0) + (parseFloat(gold) || 0) + (parseFloat(silver) || 0) + (parseFloat(stocks) || 0) - (parseFloat(debts) || 0);
    const nisab = 5000;
    if (total >= nisab) {
      setResult(total * 0.025);
    } else {
      setResult(0);
    }
  };

  const fields = [
    { labelKey: 'cashBalance', value: cash, set: setCash },
    { labelKey: 'goldValue', value: gold, set: setGold },
    { labelKey: 'silverValue', value: silver, set: setSilver },
    { labelKey: 'stocksInvestments', value: stocks, set: setStocks },
    { labelKey: 'debtsOwed', value: debts, set: setDebts },
  ];

  return (
    <div className="min-h-screen">
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground">{t('zakatCalculator')}</h1>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      <div className="px-5 pt-4 space-y-4 max-w-md mx-auto">
        {fields.map(({ labelKey, value, set }) => (
          <div key={labelKey}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t(labelKey)}</label>
            <Input
              type="number"
              placeholder="0.00"
              value={value}
              onChange={(e) => set(e.target.value)}
              className="rounded-xl"
            />
          </div>
        ))}

        <Button onClick={calculate} className="w-full rounded-xl gap-2">
          <Calculator className="h-4 w-4" />
          {t('calculateZakat')}
        </Button>

        {result !== null && (
          <div className="rounded-xl border border-primary bg-primary/5 p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('yourZakat')}</p>
            <p className="text-4xl font-bold text-primary">${result.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, MapPin, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Comprehensive currency data by country code
const COUNTRY_CURRENCIES: Record<string, { code: string; symbol: string; name: string }> = {
  SA: { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
  QA: { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري' },
  KW: { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي' },
  BH: { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني' },
  OM: { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني' },
  YE: { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني' },
  EG: { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري' },
  JO: { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني' },
  LB: { code: 'LBP', symbol: 'ل.ل', name: 'ليرة لبنانية' },
  SY: { code: 'SYP', symbol: 'ل.س', name: 'ليرة سورية' },
  IQ: { code: 'IQD', symbol: 'ع.د', name: 'دينار عراقي' },
  LY: { code: 'LYD', symbol: 'د.ل', name: 'دينار ليبي' },
  DZ: { code: 'DZD', symbol: 'د.ج', name: 'دينار جزائري' },
  MA: { code: 'MAD', symbol: 'د.م', name: 'درهم مغربي' },
  TN: { code: 'TND', symbol: 'د.ت', name: 'دينار تونسي' },
  SD: { code: 'SDG', symbol: 'ج.س', name: 'جنيه سوداني' },
  PS: { code: 'ILS', symbol: '₪', name: 'شيكل' },
  TR: { code: 'TRY', symbol: '₺', name: 'ليرة تركية' },
  PK: { code: 'PKR', symbol: '₨', name: 'روبية باكستانية' },
  IN: { code: 'INR', symbol: '₹', name: 'روبية هندية' },
  BD: { code: 'BDT', symbol: '৳', name: 'تاكا بنغلاديشية' },
  MY: { code: 'MYR', symbol: 'RM', name: 'رينغيت ماليزي' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'روبية إندونيسية' },
  US: { code: 'USD', symbol: '$', name: 'دولار أمريكي' },
  CA: { code: 'CAD', symbol: 'C$', name: 'دولار كندي' },
  GB: { code: 'GBP', symbol: '£', name: 'جنيه إسترليني' },
  DE: { code: 'EUR', symbol: '€', name: 'يورو' },
  FR: { code: 'EUR', symbol: '€', name: 'يورو' },
  NL: { code: 'EUR', symbol: '€', name: 'يورو' },
  BE: { code: 'EUR', symbol: '€', name: 'يورو' },
  IT: { code: 'EUR', symbol: '€', name: 'يورو' },
  ES: { code: 'EUR', symbol: '€', name: 'يورو' },
  AT: { code: 'EUR', symbol: '€', name: 'يورو' },
  SE: { code: 'SEK', symbol: 'kr', name: 'كرونة سويدية' },
  NO: { code: 'NOK', symbol: 'kr', name: 'كرونة نرويجية' },
  DK: { code: 'DKK', symbol: 'kr', name: 'كرونة دنماركية' },
  CH: { code: 'CHF', symbol: 'Fr', name: 'فرنك سويسري' },
  AU: { code: 'AUD', symbol: 'A$', name: 'دولار أسترالي' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'دولار نيوزيلندي' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'راند جنوب أفريقي' },
  NG: { code: 'NGN', symbol: '₦', name: 'نايرا نيجيرية' },
  AF: { code: 'AFN', symbol: '؋', name: 'أفغاني' },
  IR: { code: 'IRR', symbol: '﷼', name: 'ريال إيراني' },
  SO: { code: 'SOS', symbol: 'Sh', name: 'شلن صومالي' },
  MR: { code: 'MRU', symbol: 'أ.م', name: 'أوقية موريتانية' },
  KM: { code: 'KMF', symbol: 'CF', name: 'فرنك قمري' },
  DJ: { code: 'DJF', symbol: 'Fdj', name: 'فرنك جيبوتي' },
};

// Gold price per gram in USD (approximate, updated periodically)
// Silver price per gram in USD
// Nisab = 85g gold OR 595g silver (whichever is LOWER benefits the poor)
const GOLD_GRAM_USD = 88.5; // ~$88.5/gram (as of early 2026)
const SILVER_GRAM_USD = 1.05; // ~$1.05/gram

// Exchange rates relative to USD (approximate)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.376,
  OMR: 0.385,
  YER: 250,
  EGP: 50.5,
  JOD: 0.709,
  LBP: 89500,
  SYP: 13000,
  IQD: 1310,
  LYD: 4.85,
  DZD: 135,
  MAD: 10.0,
  TND: 3.15,
  SDG: 601,
  ILS: 3.65,
  TRY: 36.5,
  PKR: 278,
  INR: 85,
  BDT: 120,
  MYR: 4.45,
  IDR: 16200,
  CAD: 1.37,
  GBP: 0.79,
  EUR: 0.92,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.88,
  CHF: 0.88,
  AUD: 1.55,
  NZD: 1.68,
  ZAR: 18.2,
  NGN: 1550,
  AFN: 70,
  IRR: 42000,
  SOS: 571,
  MRU: 39.7,
  KMF: 453,
  DJF: 177.7,
};

const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
const ZAKAT_RATE = 0.025;

function getNisabInCurrency(currencyCode: string): { gold: number; silver: number; recommended: number } {
  const rate = EXCHANGE_RATES[currencyCode] || 1;
  const goldNisab = NISAB_GOLD_GRAMS * GOLD_GRAM_USD * rate;
  const silverNisab = NISAB_SILVER_GRAMS * SILVER_GRAM_USD * rate;
  // Use silver nisab (lower) to benefit the poor - this is the majority scholarly opinion
  return {
    gold: Math.round(goldNisab),
    silver: Math.round(silverNisab),
    recommended: Math.round(Math.min(goldNisab, silverNisab)),
  };
}

function formatNumber(num: number, symbol: string): string {
  return `${symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Get unique currencies for manual selection
const UNIQUE_CURRENCIES = Object.values(COUNTRY_CURRENCIES)
  .filter((v, i, a) => a.findIndex(c => c.code === v.code) === i)
  .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

export default function ZakatCalculator() {
  const { t } = useLocale();
  const { countryCode, city, country, loading: geoLoading } = useGeoLocation();

  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [stocks, setStocks] = useState('');
  const [property, setProperty] = useState('');
  const [debts, setDebts] = useState('');
  const [result, setResult] = useState<{ zakat: number; total: number; nisab: number; aboveNisab: boolean } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-detect currency from country
  useEffect(() => {
    if (countryCode && !selectedCurrency) {
      const cc = countryCode.toUpperCase();
      const found = COUNTRY_CURRENCIES[cc];
      if (found) {
        setSelectedCurrency(found.code);
      } else {
        setSelectedCurrency('USD');
      }
    }
  }, [countryCode, selectedCurrency]);

  const currencyInfo = useMemo(() => {
    const entry = Object.values(COUNTRY_CURRENCIES).find(c => c.code === selectedCurrency);
    return entry || { code: 'USD', symbol: '$', name: 'دولار أمريكي' };
  }, [selectedCurrency]);

  const nisabValues = useMemo(() => getNisabInCurrency(selectedCurrency || 'USD'), [selectedCurrency]);

  const calculate = () => {
    const total =
      (parseFloat(cash) || 0) +
      (parseFloat(gold) || 0) +
      (parseFloat(silver) || 0) +
      (parseFloat(stocks) || 0) +
      (parseFloat(property) || 0) -
      (parseFloat(debts) || 0);

    const aboveNisab = total >= nisabValues.recommended;
    setResult({
      zakat: aboveNisab ? total * ZAKAT_RATE : 0,
      total,
      nisab: nisabValues.recommended,
      aboveNisab,
    });
  };

  const resetAll = () => {
    setCash('');
    setGold('');
    setSilver('');
    setStocks('');
    setProperty('');
    setDebts('');
    setResult(null);
  };

  const fields = [
    { labelKey: 'cashBalance', value: cash, set: setCash, icon: '💵' },
    { labelKey: 'goldValue', value: gold, set: setGold, icon: '🥇' },
    { labelKey: 'silverValue', value: silver, set: setSilver, icon: '🥈' },
    { labelKey: 'stocksInvestments', value: stocks, set: setStocks, icon: '📈' },
    { label: 'العقارات والممتلكات التجارية', value: property, set: setProperty, icon: '🏢' },
    { labelKey: 'debtsOwed', value: debts, set: setDebts, icon: '📋' },
  ];

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className="gradient-islamic relative px-5 pb-8 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground">{t('zakatCalculator')}</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">حاسبة ذكية متعددة العملات</p>

        {/* Location badge */}
        {city && country && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs text-primary-foreground"
          >
            <MapPin className="h-3 w-3" />
            <span>{city}، {country}</span>
          </motion.div>
        )}
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-5 pt-2 space-y-4 max-w-md mx-auto">
        {/* Currency selector */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
          <label className="text-sm font-semibold text-foreground mb-2 block">العملة</label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder={geoLoading ? 'جاري التحديد...' : 'اختر العملة'} />
            </SelectTrigger>
            <SelectContent>
              {UNIQUE_CURRENCIES.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} - {c.name} ({c.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Nisab info */}
          {selectedCurrency && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 rounded-2xl bg-primary/5 border border-primary/10 p-3"
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-1">نصاب الزكاة بـ{currencyInfo.name}</p>
                  <p>• ذهب (85 غرام): {formatNumber(nisabValues.gold, currencyInfo.symbol)}</p>
                  <p>• فضة (595 غرام): {formatNumber(nisabValues.silver, currencyInfo.symbol)}</p>
                  <p className="mt-1 text-primary font-medium">
                    النصاب المعتمد: {formatNumber(nisabValues.recommended, currencyInfo.symbol)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Asset fields */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-3 shadow-elevated">
          <h2 className="text-sm font-semibold text-foreground">أصولك ومدخراتك</h2>
          {fields.map(({ labelKey, label, value, set, icon }, i) => (
            <motion.div
              key={labelKey || label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <span>{icon}</span>
                {labelKey ? t(labelKey) : label}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="rounded-2xl pr-12 text-left"
                  dir="ltr"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {currencyInfo.symbol}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={calculate} className="flex-1 rounded-xl gap-2 h-12">
            <Calculator className="h-4 w-4" />
            {t('calculateZakat')}
          </Button>
          <Button variant="outline" onClick={resetAll} className="rounded-xl h-12 px-4">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-primary bg-card overflow-hidden"
            >
              {result.aboveNisab ? (
                <>
                  <div className="gradient-islamic p-6 text-center">
                    <p className="text-sm text-primary-foreground/70 mb-1">{t('yourZakat')}</p>
                    <p className="text-4xl font-bold text-primary-foreground">
                      {formatNumber(result.zakat, currencyInfo.symbol)}
                    </p>
                  </div>
                  <div className="p-4">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center justify-between w-full text-sm text-muted-foreground"
                    >
                      <span>تفاصيل الحساب</span>
                      {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 space-y-2 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>إجمالي الأصول</span>
                              <span className="text-foreground font-medium">
                                {formatNumber(result.total, currencyInfo.symbol)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>النصاب</span>
                              <span className="text-foreground font-medium">
                                {formatNumber(result.nisab, currencyInfo.symbol)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>نسبة الزكاة</span>
                              <span className="text-foreground font-medium">2.5%</span>
                            </div>
                            <div className="border-t border-border pt-2 flex justify-between font-semibold text-sm">
                              <span className="text-foreground">الزكاة الواجبة</span>
                              <span className="text-primary">
                                {formatNumber(result.zakat, currencyInfo.symbol)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-lg font-semibold text-foreground mb-2">لا زكاة عليك</p>
                  <p className="text-sm text-muted-foreground">
                    أموالك ({formatNumber(result.total, currencyInfo.symbol)}) أقل من النصاب ({formatNumber(result.nisab, currencyInfo.symbol)})
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Islamic note */}
        <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1">📌 ملاحظة</p>
          <p>
            تعتمد هذه الحاسبة على نصاب الفضة (595 غرام) وهو الأقل، وذلك لمصلحة الفقراء وفق رأي جمهور العلماء.
            نسبة الزكاة الثابتة هي 2.5% من إجمالي المال الذي بلغ النصاب ومرّ عليه حول كامل.
          </p>
        </div>
      </div>
    </div>
  );
}

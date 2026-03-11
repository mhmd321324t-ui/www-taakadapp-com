import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { dhikrDetails } from '@/data/dhikrDetails';
import { toast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

interface DhikrSetting {
  enabled: boolean;
  count: number;
}

export default function DhikrSettings() {
  const [settings, setSettings] = useState<Record<string, DhikrSetting>>(() => {
    const saved = localStorage.getItem('dhikr-settings');
    if (saved) return JSON.parse(saved);
    const defaults: Record<string, DhikrSetting> = {};
    dhikrDetails.forEach(d => { defaults[d.key] = { enabled: true, count: d.target }; });
    return defaults;
  });

  const update = (key: string, patch: Partial<DhikrSetting>) => {
    const updated = { ...settings, [key]: { ...settings[key], ...patch } };
    setSettings(updated);
    localStorage.setItem('dhikr-settings', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="حدد الأذكار اليومية" backTo="/" />

      <div className="px-4 pt-4 space-y-3">
        {dhikrDetails.map(d => {
          const s = settings[d.key] || { enabled: true, count: d.target };
          return (
            <div
              key={d.key}
              className={cn(
                'rounded-2xl bg-card border border-border/50 p-4',
                !s.enabled && 'opacity-50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">{d.title}</span>
                <Switch checked={s.enabled} onCheckedChange={v => update(d.key, { enabled: v })} />
              </div>
              <p className="text-xs text-muted-foreground mb-1 font-amiri" dir="rtl">{d.arabic}</p>
              <p className="text-xs text-muted-foreground italic mb-3">{d.transliteration}</p>

              {s.enabled && (
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => update(d.key, { count: Math.max(1, s.count - 1) })}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="text-lg font-bold text-foreground tabular-nums w-8 text-center">{s.count}</span>
                  <button
                    onClick={() => update(d.key, { count: Math.min(100, s.count + 1) })}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => toast({ title: 'تم حفظ إعدادات الأذكار ✅' })}
          className="w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 text-sm active:scale-[0.98] transition-transform"
        >
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

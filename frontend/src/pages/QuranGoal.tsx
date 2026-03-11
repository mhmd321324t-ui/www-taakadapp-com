import { useState } from 'react';
import { Check, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

const durations = [
  { label: '5 دقائق', value: 5 },
  { label: '10 دقائق', value: 10 },
  { label: '20 دقيقة', value: 20 },
  { label: '30 دقيقة', value: 30 },
  { label: 'ساعة', value: 60 },
];

export default function QuranGoal() {
  const navigate = useNavigate();
  const saved = JSON.parse(localStorage.getItem('quran-goal') || '{}');
  const [selected, setSelected] = useState<number>(saved.duration || 10);
  const [reminder, setReminder] = useState(saved.reminder || false);
  const [time, setTime] = useState(saved.time || '08:00');

  const save = () => {
    localStorage.setItem('quran-goal', JSON.stringify({ duration: selected, reminder, time }));
    toast({ title: 'تم حفظ هدف القرآن ✅', description: `${selected} دقيقة يومياً` });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="حدّد هدف القرآن" backTo="/" />

      <div className="px-4 pt-6 space-y-4">
        <p className="text-sm text-muted-foreground text-center mb-2">
          كم من الوقت تريد قراءة القرآن يومياً؟
        </p>

        <div className="space-y-2">
          {durations.map(d => (
            <button
              key={d.value}
              onClick={() => setSelected(d.value)}
              className={cn(
                'w-full rounded-2xl bg-card border border-border/50 p-4 flex items-center justify-between',
                selected === d.value && 'border-primary bg-primary/5'
              )}
            >
              <span className={cn('text-sm font-bold', selected === d.value ? 'text-primary' : 'text-foreground')}>
                {d.label}
              </span>
              {selected === d.value && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Reminder */}
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold text-foreground">تذكير يومي</span>
            </div>
            <Switch checked={reminder} onCheckedChange={setReminder} />
          </div>
          {reminder && (
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2 text-sm text-foreground"
            />
          )}
        </div>

        <button
          onClick={save}
          className="w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 text-sm active:scale-[0.98] transition-transform"
        >
          أنشئ هدفاً
        </button>
      </div>
    </div>
  );
}

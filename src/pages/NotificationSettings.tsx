import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Volume2, Clock, BookOpen, Moon, MessageSquare, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { requestNotificationPermission } from '@/hooks/useAthanNotifications';
import { toast } from 'sonner';
import AthanSelector from '@/components/AthanSelector';

interface NotifSetting {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  schedule?: string;
  defaultEnabled?: boolean;
}

const prayerSettings: NotifSetting[] = [
  {
    key: 'athan-notifications',
    label: 'تنبيهات الصلاة',
    description: 'إشعار عند دخول وقت كل صلاة',
    icon: <Bell className="h-5 w-5" />,
    defaultEnabled: true,
  },
  {
    key: 'prayer-reminder',
    label: 'تذكير قبل الصلاة',
    description: 'تذكير قبل وقت الصلاة بدقائق',
    icon: <Clock className="h-5 w-5" />,
    schedule: 'قبل 10 دقائق',
    defaultEnabled: true,
  },
  {
    key: 'prayer-tracker-reminder',
    label: 'سجلات الصلاة',
    description: 'تذكير لتحديد صلواتك',
    icon: <Bell className="h-5 w-5" />,
    defaultEnabled: true,
  },
];

const dailyGoalSettings: NotifSetting[] = [
  {
    key: 'quran-listen-reminder',
    label: 'استمع إلى القرآن',
    description: 'تذكير بالاستماع إلى القرآن يوميًا',
    icon: <BookOpen className="h-5 w-5" />,
    schedule: 'مجدول في الساعة 08:00 م مساءً',
    defaultEnabled: true,
  },
  {
    key: 'dhikr-daily-reminder',
    label: 'الذكر اليومي',
    description: 'تذكير بذكر الله اليومي المجدول',
    icon: <Sparkles className="h-5 w-5" />,
    defaultEnabled: true,
  },
];

const otherSettings: NotifSetting[] = [
  {
    key: 'daily-stories-reminder',
    label: 'القصص اليومية',
    description: 'إشعار لمشاهدة القصص اليومية الساعة 9:00 مساءً',
    icon: <MessageSquare className="h-5 w-5" />,
    schedule: '9:00 مساءً',
    defaultEnabled: true,
  },
  {
    key: 'friday-reminder',
    label: 'جمعة مميزة',
    description: 'تذكير بقراءة سورة الكهف كل جمعة',
    icon: <BookOpen className="h-5 w-5" />,
    defaultEnabled: true,
  },
  {
    key: 'suhoor-reminder',
    label: 'تذكير بالسحور',
    description: 'فقط خلال رمضان',
    icon: <Moon className="h-5 w-5" />,
    schedule: 'بقيت ساعة على الفجر',
    defaultEnabled: true,
  },
];

function SettingRow({ setting }: { setting: NotifSetting }) {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(`notif-${setting.key}`);
    return saved !== null ? saved === 'true' : (setting.defaultEnabled ?? false);
  });

  const toggle = async () => {
    if (!enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('يرجى السماح بالإشعارات من إعدادات المتصفح');
        return;
      }
    }
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem(`notif-${setting.key}`, String(newVal));
    // Also sync the main athan toggle
    if (setting.key === 'athan-notifications') {
      localStorage.setItem('athan-notifications', String(newVal));
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border/30 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{setting.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
        {setting.schedule && enabled && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{setting.schedule}</span>
          </div>
        )}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={toggle}
        className="shrink-0 mr-3 data-[state=checked]:bg-primary"
      />
    </div>
  );
}

export default function NotificationSettings() {
  const [showAthanSelector, setShowAthanSelector] = useState(false);

  return (
    <div className="min-h-screen pb-24 bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3">
          <Link to="/more" className="p-2 -mr-2 rounded-xl transition-all active:scale-90">
            <ArrowRight className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-bold text-foreground">الإشعارات</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Prayers section */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-muted-foreground mb-2 mr-1">الصلوات</p>
        <div className="rounded-3xl bg-card border border-border/50 px-5 shadow-elevated">
          {prayerSettings.map(s => (
            <SettingRow key={s.key} setting={s} />
          ))}
          {/* Athan selector link */}
          <div
            className="flex items-center justify-between py-4 border-b border-border/30 cursor-pointer active:bg-muted/50 transition-colors rounded-xl"
            onClick={() => setShowAthanSelector(!showAthanSelector)}
          >
            <div>
              <p className="text-sm font-bold text-foreground">تحديد الأذان</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(() => {
                  const id = localStorage.getItem('athan-sound') || 'makkah';
                  const names: Record<string, string> = { makkah: 'مكة', madinah: 'المدينة', turkish: 'تركي', umayyad: 'الأموي', quds: 'الأقصى', abdulbasit: 'عبد الباسط', shahat: 'شحات', saqqaf: 'السقاف', default: 'تنبيه بسيط' };
                  return names[id] || 'مكة';
                })()}
              </p>
            </div>
            <ArrowRight className={cn("h-4 w-4 text-muted-foreground transition-transform", showAthanSelector && "rotate-90")} style={{ transform: showAthanSelector ? 'rotate(-90deg)' : 'rotate(180deg)' }} />
          </div>
        </div>
      </div>

      {/* Athan selector expandable */}
      {showAthanSelector && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 mt-3"
        >
          <div className="rounded-3xl bg-card border border-border/50 p-5 shadow-elevated">
            <AthanSelector />
          </div>
        </motion.div>
      )}

      {/* Daily goals section */}
      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-muted-foreground mb-2 mr-1">الأهداف اليومية</p>
        <div className="rounded-3xl bg-card border border-border/50 px-5 shadow-elevated">
          {dailyGoalSettings.map(s => (
            <SettingRow key={s.key} setting={s} />
          ))}
        </div>
      </div>

      {/* Other section */}
      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-muted-foreground mb-2 mr-1">تنبيهات أخرى</p>
        <div className="rounded-3xl bg-card border border-border/50 px-5 shadow-elevated">
          {otherSettings.map(s => (
            <SettingRow key={s.key} setting={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

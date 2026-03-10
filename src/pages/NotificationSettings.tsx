import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Volume2, Clock, BookOpen, Moon, MessageSquare, Sparkles, TestTube, ChevronDown, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { requestNotificationPermission } from '@/hooks/useAthanNotifications';
import { sendTestNotification } from '@/lib/prayerNotifications';
import { testAthanPlayback } from '@/lib/athanAudio';
import { subscribeToPush, isSubscribedToPush } from '@/lib/pushSubscription';
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
  { key: 'athan-notifications', label: 'تنبيهات الصلاة', description: 'إشعار عند دخول وقت كل صلاة', icon: <Bell className="h-5 w-5" />, defaultEnabled: true },
  { key: 'prayer-reminder', label: 'تذكير قبل الصلاة', description: 'تذكير قبل وقت الصلاة بدقائق', icon: <Clock className="h-5 w-5" />, schedule: 'قبل 10 دقائق', defaultEnabled: true },
  { key: 'prayer-tracker-reminder', label: 'سجلات الصلاة', description: 'تذكير لتحديد صلواتك', icon: <Bell className="h-5 w-5" />, defaultEnabled: true },
];

const dailyGoalSettings: NotifSetting[] = [
  { key: 'quran-listen-reminder', label: 'استمع إلى القرآن', description: 'تذكير بالاستماع إلى القرآن يوميًا', icon: <BookOpen className="h-5 w-5" />, schedule: '08:00 مساءً', defaultEnabled: true },
  { key: 'dhikr-daily-reminder', label: 'الذكر اليومي', description: 'تذكير بذكر الله اليومي', icon: <Sparkles className="h-5 w-5" />, defaultEnabled: true },
];

const otherSettings: NotifSetting[] = [
  { key: 'daily-stories-reminder', label: 'القصص اليومية', description: 'إشعار لمشاهدة القصص اليومية', icon: <MessageSquare className="h-5 w-5" />, schedule: '9:00 مساءً', defaultEnabled: true },
  { key: 'friday-reminder', label: 'جمعة مميزة', description: 'تذكير بقراءة سورة الكهف كل جمعة', icon: <BookOpen className="h-5 w-5" />, defaultEnabled: true },
  { key: 'suhoor-reminder', label: 'تذكير بالسحور', description: 'فقط خلال رمضان', icon: <Moon className="h-5 w-5" />, schedule: 'قبل الفجر بساعة', defaultEnabled: true },
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
    if (setting.key === 'athan-notifications') {
      localStorage.setItem('athan-notifications', String(newVal));
    }
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b border-border/20 last:border-b-0">
      <div className="mt-0.5 h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {setting.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{setting.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
        {setting.schedule && enabled && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{setting.schedule}</span>
          </div>
        )}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={toggle}
        className="shrink-0 mt-1 data-[state=checked]:bg-primary"
      />
    </div>
  );
}

function SettingsSection({ title, settings }: { title: string; settings: NotifSetting[] }) {
  return (
    <div className="px-4 mt-5">
      <p className="text-xs font-bold text-muted-foreground mb-2 me-1">{title}</p>
      <div className="rounded-2xl bg-card border border-border/40 px-4">
        {settings.map(s => <SettingRow key={s.key} setting={s} />)}
      </div>
    </div>
  );
}

export default function NotificationSettings() {
  const [showAthanSelector, setShowAthanSelector] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Check push subscription status on mount
  useEffect(() => {
    isSubscribedToPush().then(setPushSubscribed);
  }, []);

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('يرجى السماح بالإشعارات من إعدادات المتصفح');
        return;
      }
      // Get user location
      const cached = localStorage.getItem('cached-location');
      if (cached) {
        const loc = JSON.parse(cached);
        const success = await subscribeToPush(loc.latitude, loc.longitude, loc.calculationMethod || 3);
        setPushSubscribed(success);
        if (success) {
          toast.success('تم تفعيل الإشعارات في الخلفية ✅ ستصلك حتى عند إغلاق التطبيق');
        } else {
          toast.error('تعذر تفعيل الإشعارات في الخلفية');
        }
      } else {
        toast.error('يرجى تفعيل الموقع أولاً لتحديد أوقات الصلاة');
      }
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      toast.error('يرجى السماح بالإشعارات أولاً');
      return;
    }
    const sent = sendTestNotification();
    if (sent) {
      toast.success('تم إرسال إشعار تجريبي ✅');
    } else {
      toast.error('تعذر إرسال الإشعار');
    }
  };

  const handleTestAthan = () => {
    const played = testAthanPlayback();
    if (played) {
      toast.success('جارٍ تشغيل الأذان... (5 ثوانٍ)');
    } else {
      toast.error('تعذر تشغيل الصوت');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3">
          <Link to="/more" className="p-2 -me-2 rounded-xl transition-all active:scale-90">
            <ArrowRight className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-bold text-foreground">الإشعارات والأذان</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Test buttons */}
      <div className="px-4 mt-4 flex gap-3">
        <Button
          onClick={handleTestNotification}
          variant="outline"
          className="flex-1 h-12 rounded-2xl gap-2 text-sm font-bold"
        >
          <TestTube className="h-4 w-4" />
          اختبار الإشعار
        </Button>
        <Button
          onClick={handleTestAthan}
          variant="outline"
          className="flex-1 h-12 rounded-2xl gap-2 text-sm font-bold"
        >
          <Volume2 className="h-4 w-4" />
          اختبار الأذان
        </Button>
      </div>

      {/* Prayer settings */}
      <SettingsSection title="الصلوات" settings={prayerSettings} />

      {/* Athan selector */}
      <div className="px-4 mt-3">
        <button
          onClick={() => setShowAthanSelector(!showAthanSelector)}
          className="w-full flex items-center justify-between rounded-2xl bg-card border border-border/40 p-4 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">تحديد صوت الأذان</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(() => {
                  const id = localStorage.getItem('athan-sound') || 'makkah';
                  const names: Record<string, string> = { makkah: 'مكة', madinah: 'المدينة', turkish: 'تركي', umayyad: 'الأموي', quds: 'الأقصى', abdulbasit: 'عبد الباسط', shahat: 'شحات', saqqaf: 'السقاف', default: 'تنبيه بسيط' };
                  return names[id] || 'مكة';
                })()}
              </p>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showAthanSelector && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {showAthanSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 mt-2 overflow-hidden"
          >
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <AthanSelector />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily goals */}
      <SettingsSection title="الأهداف اليومية" settings={dailyGoalSettings} />

      {/* Other */}
      <SettingsSection title="تنبيهات أخرى" settings={otherSettings} />

      {/* Info note */}
      <div className="px-4 mt-6 mb-8">
        <div className="rounded-2xl bg-muted/50 border border-border/30 p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 الإشعارات تعمل حتى عندما يكون التطبيق مغلقاً! قم بتثبيت التطبيق كـ PWA وفعّل الإشعارات لتصلك تنبيهات الأذان في كل وقت صلاة تلقائياً.
          </p>
        </div>
      </div>
    </div>
  );
}

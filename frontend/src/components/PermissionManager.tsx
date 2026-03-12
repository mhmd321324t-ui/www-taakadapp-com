/**
 * PermissionManager - Native-like permission request UI
 * Shows pre-request screens explaining benefits before system prompts
 * Designed for Google Play Protect compliance (Android 14+ / API 34)
 */
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Bell, HardDrive, X, ChevronLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type PermissionType = 'location' | 'notifications' | 'storage';
type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface PermissionState {
  location: PermissionStatus;
  notifications: PermissionStatus;
  storage: PermissionStatus;
}

const PERMISSION_DISMISSED_KEY = 'permissions_dismissed';
const PERMISSION_CHECK_KEY = 'permissions_checked';

interface PermissionConfig {
  type: PermissionType;
  icon: typeof MapPin;
  title: string;
  subtitle: string;
  benefits: string[];
  gradient: string;
  iconColor: string;
}

const permissionConfigs: PermissionConfig[] = [
  {
    type: 'location',
    icon: MapPin,
    title: 'الموقع الجغرافي',
    subtitle: 'لتحديد أوقات الصلاة بدقة لموقعك',
    benefits: [
      'أوقات صلاة دقيقة لمدينتك ومنطقتك',
      'اتجاه القبلة الصحيح من موقعك الحالي',
      'البحث عن أقرب المساجد إليك',
      'تحديد طريقة الحساب المناسبة لبلدك',
    ],
    gradient: 'from-emerald-600 to-teal-700',
    iconColor: 'text-emerald-400',
  },
  {
    type: 'notifications',
    icon: Bell,
    title: 'الإشعارات',
    subtitle: 'لتنبيهك بأوقات الصلاة والأذكار',
    benefits: [
      'تنبيه بصوت الأذان عند دخول وقت الصلاة',
      'أذكار الصباح والمساء في أوقاتها',
      'تذكير بصلاة الفجر والقيام',
      'إشعارات بالمناسبات الإسلامية',
    ],
    gradient: 'from-amber-600 to-orange-700',
    iconColor: 'text-amber-400',
  },
];

async function checkPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
  try {
    if (type === 'location') {
      if (!navigator.geolocation) return 'unsupported';
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as PermissionStatus;
    }
    if (type === 'notifications') {
      if (!('Notification' in window)) return 'unsupported';
      const state = Notification.permission;
      if (state === 'default') return 'prompt';
      return state as PermissionStatus;
    }
    if (type === 'storage') {
      if (!navigator.storage?.persist) return 'unsupported';
      const persisted = await navigator.storage.persisted();
      return persisted ? 'granted' : 'prompt';
    }
  } catch {
    return 'prompt';
  }
  return 'prompt';
}

async function requestPermission(type: PermissionType): Promise<boolean> {
  try {
    if (type === 'location') {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
    if (type === 'notifications') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    if (type === 'storage') {
      if (navigator.storage?.persist) {
        return await navigator.storage.persist();
      }
      return false;
    }
  } catch {
    return false;
  }
  return false;
}

export function PermissionManager() {
  const [permStates, setPermStates] = useState<PermissionState>({
    location: 'prompt',
    notifications: 'prompt',
    storage: 'prompt',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Determine which permissions still need requesting
  const pendingPermissions = permissionConfigs.filter(
    (p) => permStates[p.type] === 'prompt'
  );

  useEffect(() => {
    const dismissed = localStorage.getItem(PERMISSION_DISMISSED_KEY);
    if (dismissed === 'true') return;

    const checked = localStorage.getItem(PERMISSION_CHECK_KEY);
    if (checked) {
      const lastCheck = parseInt(checked, 10);
      // Don't re-check within 24 hours if user hasn't granted
      if (Date.now() - lastCheck < 86400000) return;
    }

    const checkAll = async () => {
      const [loc, notif, stor] = await Promise.all([
        checkPermissionStatus('location'),
        checkPermissionStatus('notifications'),
        checkPermissionStatus('storage'),
      ]);

      const newState: PermissionState = {
        location: loc,
        notifications: notif,
        storage: stor,
      };
      setPermStates(newState);

      // Show UI only if there are permissions to request
      const hasPending = [loc, notif].some((s) => s === 'prompt');
      if (hasPending) {
        // Wait for app to settle before showing
        setTimeout(() => setVisible(true), 2000);
      }

      localStorage.setItem(PERMISSION_CHECK_KEY, String(Date.now()));
    };

    checkAll();
  }, []);

  const handleRequest = useCallback(async () => {
    if (pendingPermissions.length === 0) return;
    const perm = pendingPermissions[currentStep];
    if (!perm) return;

    setRequesting(true);
    const granted = await requestPermission(perm.type);
    setPermStates((prev) => ({
      ...prev,
      [perm.type]: granted ? 'granted' : 'denied',
    }));
    setRequesting(false);

    // Move to next permission or close
    if (currentStep < pendingPermissions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setVisible(false);
    }
  }, [currentStep, pendingPermissions]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(PERMISSION_DISMISSED_KEY, 'true');
  }, []);

  const handleSkip = useCallback(() => {
    if (currentStep < pendingPermissions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setVisible(false);
      // All permissions skipped — don't show again for 24h
      localStorage.setItem(PERMISSION_CHECK_KEY, String(Date.now()));
    }
  }, [currentStep, pendingPermissions]);

  if (!visible || pendingPermissions.length === 0) return null;

  const config = pendingPermissions[currentStep];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div
      data-testid="permission-manager-overlay"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      dir="rtl"
    >
      <div className="w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl bg-card border border-border/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {/* Header with gradient */}
        <div className={cn('relative p-8 pb-12 bg-gradient-to-br', config.gradient)}>
          <button
            onClick={handleDismiss}
            data-testid="permission-dismiss-btn"
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
            <Shield className="h-3.5 w-3.5" />
            <span>
              {currentStep + 1} من {pendingPermissions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Icon className={cn('h-8 w-8', config.iconColor)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              <p className="text-white/70 text-sm mt-1">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="px-6 -mt-6">
          <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-lg">
            <p className="text-xs font-bold text-muted-foreground mb-3">
              لماذا نحتاج هذا الإذن؟
            </p>
            <ul className="space-y-3">
              {config.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronLeft className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleRequest}
            disabled={requesting}
            data-testid={`permission-grant-${config.type}`}
            className={cn(
              'w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]',
              'bg-gradient-to-r',
              config.gradient,
              requesting && 'opacity-60'
            )}
          >
            {requesting ? 'جارٍ الطلب...' : 'السماح'}
          </button>
          <button
            onClick={handleSkip}
            data-testid={`permission-skip-${config.type}`}
            className="w-full py-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            لاحقاً
          </button>
        </div>

        {/* Privacy note */}
        <div className="px-6 pb-6">
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            نحترم خصوصيتك. لن نشارك بياناتك مع أي طرف ثالث.
            يمكنك تغيير الأذونات في أي وقت من إعدادات جهازك.
          </p>
        </div>
      </div>
    </div>
  );
}

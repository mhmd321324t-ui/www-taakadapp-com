import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { Download, Share, CheckCircle2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const { t } = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <div className="gradient-islamic relative px-5 pb-16 pt-safe-header-compact">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">📲 تثبيت التطبيق</h1>
          <p className="text-white/70 text-sm mt-1.5 leading-relaxed">أضف تأكد إلى شاشتك الرئيسية</p>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-5 pt-4 max-w-md mx-auto">
        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary bg-primary/5 p-6 text-center"
          >
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">التطبيق مثبّت بالفعل! ✅</h2>
            <p className="text-sm text-muted-foreground">يمكنك فتح تأكد من شاشتك الرئيسية</p>
          </motion.div>
        ) : (
          <>
            {/* App preview card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 text-center mb-6"
            >
              <img src="/pwa-icon-192.png" alt="تأكد" className="h-20 w-20 rounded-2xl mx-auto mb-4 shadow-lg" />
              <h2 className="text-xl font-bold text-foreground mb-1">تأكد</h2>
              <p className="text-sm text-muted-foreground mb-4">تطبيقك الإسلامي الشامل</p>
              
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-lg font-bold text-foreground">🕌</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">مواقيت الصلاة</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-lg font-bold text-foreground">📖</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">القرآن</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-lg font-bold text-foreground">🧭</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">القبلة</p>
                </div>
              </div>

              {deferredPrompt ? (
                <Button onClick={handleInstall} className="w-full rounded-xl h-12 gap-2 text-base">
                  <Download className="h-5 w-5" />
                  تثبيت التطبيق
                </Button>
              ) : isIOS ? (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-right space-y-3">
                  <p className="text-sm font-bold text-foreground">لتثبيت التطبيق على iPhone:</p>
                  <div className="flex items-center gap-3 justify-end">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-bold">١.</span> اضغط على زر <span className="font-medium text-foreground">المشاركة</span>
                    </p>
                    <Share className="h-5 w-5 text-primary shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-bold">٢.</span> اختر <span className="font-medium text-foreground">"إضافة إلى الشاشة الرئيسية"</span>
                    </p>
                    <Smartphone className="h-5 w-5 text-primary shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-bold">٣.</span> اضغط <span className="font-medium text-foreground">"إضافة"</span>
                    </p>
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    افتح التطبيق من متصفح Chrome ثم اضغط على قائمة المتصفح → "تثبيت التطبيق"
                  </p>
                </div>
              )}
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-bold text-foreground">✨ مميزات التثبيت</h3>
              {[
                { emoji: '⚡', text: 'فتح فوري بدون متصفح' },
                { emoji: '📶', text: 'يعمل بدون إنترنت' },
                { emoji: '🔔', text: 'تنبيهات مواقيت الصلاة' },
                { emoji: '💾', text: 'تخزين البيانات محلياً' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 justify-end rounded-xl bg-card border border-border p-3">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <span className="text-xl shrink-0">{item.emoji}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

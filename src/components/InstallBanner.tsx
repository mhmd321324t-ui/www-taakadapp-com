import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('install-banner-dismissed')) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show immediately (1 second delay for smooth entrance)
    const timer = setTimeout(() => setShow(true), 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    // Only dismiss for 24 hours so they see it again
    localStorage.setItem('install-banner-dismissed', String(Date.now()));
  };

  // Check if dismissal expired (24 hours)
  useEffect(() => {
    const dismissed = localStorage.getItem('install-banner-dismissed');
    if (dismissed && dismissed !== 'true') {
      const dismissedAt = parseInt(dismissed);
      if (Date.now() - dismissedAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('install-banner-dismissed');
      }
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        localStorage.setItem('install-banner-dismissed', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={dismiss}
          />
          {/* Install dialog */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl bg-card border-t border-border p-6 pb-8 shadow-2xl"
            dir="rtl"
          >
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-5" />

            <div className="flex flex-col items-center text-center gap-4">
              {/* App icon */}
              <div className="relative">
                <img src="/pwa-icon-192.png" alt="تأكد" className="h-20 w-20 rounded-[22px] shadow-lg" />
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow">
                  <Download className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg font-bold text-foreground">ثبّت تطبيق تأكد</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  وصول سريع لمواقيت الصلاة، القرآن والأذكار
                </p>
              </div>

              {/* Features */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">✅ بدون إنترنت</span>
                <span className="flex items-center gap-1">⚡ سريع</span>
                <span className="flex items-center gap-1">📱 كالتطبيق</span>
              </div>

              {/* Install button */}
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg active:scale-[0.98] transition-transform"
                >
                  <Download className="h-5 w-5 inline-block ml-2 -mt-0.5" />
                  تثبيت التطبيق
                </button>
              ) : isIOS ? (
                <div className="w-full space-y-3">
                  <p className="text-sm text-muted-foreground">
                    اضغط على <span className="inline-block mx-1">
                      <svg className="inline h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6a2 2 0 01-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3a2 2 0 012 2z"/></svg>
                    </span> ثم <strong>"أضف إلى الشاشة الرئيسية"</strong>
                  </p>
                  <Link
                    to="/install"
                    onClick={dismiss}
                    className="block w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground text-center shadow-lg"
                  >
                    <Smartphone className="h-5 w-5 inline-block ml-2 -mt-0.5" />
                    شرح التثبيت
                  </Link>
                </div>
              ) : (
                <Link
                  to="/install"
                  onClick={dismiss}
                  className="block w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground text-center shadow-lg"
                >
                  <Download className="h-5 w-5 inline-block ml-2 -mt-0.5" />
                  تثبيت التطبيق
                </Link>
              )}

              {/* Dismiss */}
              <button onClick={dismiss} className="text-sm text-muted-foreground mt-1">
                ليس الآن
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

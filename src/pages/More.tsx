import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Calendar, BarChart3, Calculator, Settings, LogIn, LogOut, User, Globe, Moon as MoonIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';
import { toast } from 'sonner';

const items = [
  { icon: Heart, labelKey: 'tasbeeh', path: '/tasbeeh', color: 'text-primary' },
  { icon: Calendar, labelKey: 'calendar', path: '/calendar', color: 'text-islamic-green' },
  { icon: BarChart3, labelKey: 'tracker', path: '/tracker', color: 'text-accent' },
  { icon: Calculator, labelKey: 'zakatCalculator', path: '/zakat', color: 'text-islamic-gold' },
];

const languages: { code: Locale; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ur', label: 'اردو' },
];

export default function More() {
  const { t, locale, setLocale } = useLocale();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleLanguageChange = async (lang: Locale) => {
    setLocale(lang);
    setShowLangPicker(false);

    if (user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('user_id', user.id);
    }
    toast.success('تم تغيير اللغة');
  };

  // Load user preferences from DB
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('language, dark_mode')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.language) {
            setLocale(data.language as Locale);
          }
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen">
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground">{t('more')}</h1>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* User card */}
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
          >
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/auth"
              className="flex items-center gap-4 rounded-xl border border-primary bg-primary/5 p-4 hover:shadow-md transition-all"
            >
              <LogIn className="h-6 w-6 text-primary" />
              <span className="text-primary font-semibold">تسجيل الدخول / إنشاء حساب</span>
            </Link>
          </motion.div>
        )}

        {/* Feature items */}
        {items.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (i + 1) * 0.06 }}
          >
            <Link
              to={item.path}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <span className="text-foreground font-medium">{t(item.labelKey)}</span>
            </Link>
          </motion.div>
        ))}

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Globe className="h-6 w-6 text-muted-foreground" />
            <span className="text-foreground font-medium flex-1 text-start">
              {languages.find(l => l.code === locale)?.label || 'Language'}
            </span>
          </button>

          {showLangPicker && (
            <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-start px-4 py-3 text-sm transition-colors ${
                    locale === lang.code
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

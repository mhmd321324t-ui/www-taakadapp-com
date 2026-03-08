import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';
import {
  Compass, Heart, Calculator, User,
  LogIn, LogOut, Moon, BookOpen, Clock, CheckCircle2, MessageSquare, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AthanSelector from '@/components/AthanSelector';

const features = [
  { icon: Compass, label: 'اتجاه القبلة', path: '/qibla', gradient: 'from-primary/15 to-islamic-teal/10' },
  { icon: Heart, label: 'عداد التسبيح', path: '/tasbeeh', gradient: 'from-accent/15 to-islamic-gold/10' },
  { icon: Clock, label: 'مواقيت الصلاة', path: '/prayer-times', gradient: 'from-primary/15 to-islamic-emerald/10' },
  { icon: BookOpen, label: 'القرآن', path: '/quran', gradient: 'from-islamic-purple/15 to-primary/10' },
  { icon: Moon, label: 'الأدعية', path: '/duas', gradient: 'from-islamic-copper/15 to-accent/10' },
  { icon: MessageSquare, label: 'قصص حقيقية', path: '/stories', gradient: 'from-primary/15 to-accent/10' },
  { icon: Calculator, label: 'حاسبة الزكاة', path: '/zakat', gradient: 'from-islamic-teal/15 to-primary/10' },
  { icon: CheckCircle2, label: 'متابعة الصلاة', path: '/tracker', gradient: 'from-primary/15 to-islamic-emerald/10' },
  { icon: User, label: 'حسابي', path: '/account', gradient: 'from-accent/15 to-islamic-copper/10' },
];

export default function More() {
  const { t } = useLocale();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const allFeatures = isAdmin
    ? [...features, { icon: Shield, label: 'لوحة التحكم', path: '/admin', gradient: 'from-destructive/15 to-destructive/5' }]
    : features;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-safe-header-compact pb-4 text-center">
        <h1 className="text-foreground">الميزات</h1>
      </div>

      {/* User card */}
      <div className="px-5 mb-5">
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/50 bg-card p-5 flex items-center gap-4 shadow-elevated"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate text-base">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="rounded-xl h-11 w-11 shrink-0">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/auth"
              className="flex items-center justify-center gap-3 rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-elevated transition-all active:scale-[0.98]"
            >
              <LogIn className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold">{t('loginSignup')}</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Features grid */}
      <div className="px-5">
        <div className="rounded-3xl bg-card border border-border/50 p-5 shadow-elevated">
          <div className="grid grid-cols-3 gap-5">
            {allFeatures.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={item.path}
                  className="flex flex-col items-center gap-2.5 min-w-0"
                >
                  <div className={cn(
                    'h-16 w-16 rounded-2xl bg-gradient-to-br border border-border/50 flex items-center justify-center shrink-0 transition-transform active:scale-95',
                    item.gradient
                  )}>
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-snug w-full break-words">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Athan Sound Selector */}
      <div className="px-5 mt-5">
        <div className="rounded-3xl bg-card border border-border/50 p-5 shadow-elevated">
          <h2 className="text-foreground mb-3">🔊 صوت الأذان</h2>
          <AthanSelector />
        </div>
      </div>
    </div>
  );
}

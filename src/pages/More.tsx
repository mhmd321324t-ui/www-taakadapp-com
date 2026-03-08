import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  Compass, Heart, Calculator, User,
  LogIn, LogOut, Moon, BookOpen, Clock, CheckCircle2, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  { icon: Compass, label: 'اتجاه القبلة', path: '/qibla', bg: 'bg-primary' },
  { icon: Heart, label: 'عداد التسبيح', path: '/tasbeeh', bg: 'bg-primary' },
  { icon: Clock, label: 'مواقيت الصلاة', path: '/prayer-times', bg: 'bg-primary' },
  { icon: BookOpen, label: 'القرآن', path: '/quran', bg: 'bg-primary' },
  { icon: Moon, label: 'الأدعية', path: '/duas', bg: 'bg-primary' },
  { icon: MessageSquare, label: 'قصص حقيقية', path: '/stories', bg: 'bg-primary' },
  { icon: Calculator, label: 'حاسبة الزكاة', path: '/zakat', bg: 'bg-primary' },
  { icon: CheckCircle2, label: 'متابعة الصلاة', path: '/tracker', bg: 'bg-primary' },
  { icon: User, label: 'حسابي', path: '/auth', bg: 'bg-primary' },
];

export default function More() {
  const { t } = useLocale();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 text-center">
        <h1 className="text-xl font-bold text-foreground">الميزات</h1>
      </div>

      {/* User card */}
      <div className="px-5 mb-5">
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
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
              className="flex items-center justify-center gap-3 rounded-2xl border border-primary bg-primary/5 p-4"
            >
              <LogIn className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold text-sm">{t('loginSignup')}</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Features grid */}
      <div className="px-5">
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="grid grid-cols-4 gap-4">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={item.path}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center', item.bg)}>
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

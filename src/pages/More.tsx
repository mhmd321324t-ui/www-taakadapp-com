import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Heart, Calendar, BarChart3, Calculator, LogIn, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const items = [
  { icon: Heart, labelKey: 'tasbeeh', path: '/tasbeeh', color: 'text-primary' },
  { icon: Calendar, labelKey: 'calendar', path: '/calendar', color: 'text-islamic-green' },
  { icon: BarChart3, labelKey: 'tracker', path: '/tracker', color: 'text-accent' },
  { icon: Calculator, labelKey: 'zakatCalculator', path: '/zakat', color: 'text-islamic-gold' },
];

export default function More() {
  const { t } = useLocale();
  const { user, signOut } = useAuth();

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
              <span className="text-primary font-semibold">{t('loginSignup')}</span>
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
      </div>
    </div>
  );
}

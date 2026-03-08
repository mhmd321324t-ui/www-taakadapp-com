import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { User, LogOut, Mail, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  const provider = user.app_metadata?.provider || 'email';
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-safe-header-compact pb-4 text-center">
        <h1 className="text-foreground">حسابي</h1>
      </div>

      {/* Avatar & Name */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/50 bg-card p-6 shadow-elevated flex flex-col items-center text-center"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-20 w-20 rounded-full border-2 border-primary/30 mb-4 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border-2 border-primary/20 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}
          <h2 className="text-lg font-bold text-foreground mb-1">{name || 'مستخدم'}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </motion.div>
      </div>

      {/* Info cards */}
      <div className="px-5 space-y-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-relaxed">البريد الإلكتروني</p>
            <p className="text-sm font-semibold text-foreground truncate">{email}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-relaxed">طريقة الدخول</p>
            <p className="text-sm font-semibold text-foreground capitalize">{provider === 'google' ? 'Google' : 'بريد إلكتروني'}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">تاريخ الانضمام</p>
            <p className="text-sm font-semibold text-foreground">{createdAt}</p>
          </div>
        </motion.div>
      </div>

      {/* Sign out */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full rounded-2xl h-12 gap-3 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

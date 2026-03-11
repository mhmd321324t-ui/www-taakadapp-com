import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Auth() {
  const { t } = useLocale();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect logged-in users to account page
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'بريد إلكتروني أو كلمة مرور غير صحيحة');
        } else {
          toast.success(t('loginSuccess') || 'تم تسجيل الدخول بنجاح ✅');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
        } else {
          toast.success(t('signupSuccess') || 'تم إنشاء الحساب بنجاح ✅');
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" dir="rtl">
      <div className="gradient-islamic islamic-pattern relative px-5 pb-12 pt-safe-header text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-arabic text-primary-foreground mb-2">{t('appName')}</h1>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">{t('yourIslamicApp')}</p>
        </motion.div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="flex-1 px-5 pt-4 max-w-md mx-auto w-full">
        <motion.form onSubmit={handleEmailAuth} className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {!isLogin && (
            <div className="relative">
              <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('name') || 'الاسم'} value={name} onChange={e => setName(e.target.value)} className="pe-9 rounded-2xl h-12 border-border/50" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder={t('email') || 'البريد الإلكتروني'} value={email} onChange={e => setEmail(e.target.value)} className="pe-9 rounded-2xl h-12 border-border/50" required />
          </div>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder={t('password') || 'كلمة المرور'} value={password} onChange={e => setPassword(e.target.value)} className="pe-9 rounded-2xl h-12 border-border/50" required minLength={6} />
          </div>
          <Button type="submit" className="w-full rounded-2xl h-12 font-bold" disabled={loading}>
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : isLogin ? (t('login') || 'تسجيل الدخول') : (t('signup') || 'إنشاء حساب')}
          </Button>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? (t('noAccount') || 'ليس لديك حساب؟') : (t('hasAccount') || 'لديك حساب؟')}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium">
            {isLogin ? (t('signup') || 'إنشاء حساب') : (t('login') || 'تسجيل الدخول')}
          </button>
        </p>

        <div className="mt-8 p-4 bg-muted/50 rounded-2xl text-center text-xs text-muted-foreground">
          <p>يمكنك استخدام معظم الميزات بدون تسجيل دخول</p>
          <p className="mt-1">التسجيل يتيح مزامنة بياناتك عبر الأجهزة</p>
        </div>
      </div>
    </div>
  );
}

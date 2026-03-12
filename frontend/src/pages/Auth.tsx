import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

export default function Auth() {
  const { t } = useLocale();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true });
  }, [user, authLoading, navigate]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (user) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const msg = error.message || '';
          if (msg.includes('غير صحيحة') || msg.includes('401')) {
            toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          } else {
            toast.error(msg || 'حدث خطأ أثناء تسجيل الدخول');
          }
        } else {
          toast.success('أهلاً بك!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email.trim(), password, name.trim());
        if (error) {
          const msg = error.message || '';
          if (msg.includes('مسجل')) {
            toast.error('هذا البريد الإلكتروني مسجل مسبقاً');
          } else {
            toast.error(msg || 'حدث خطأ أثناء إنشاء الحساب');
          }
        } else {
          toast.success('تم إنشاء حسابك بنجاح');
          navigate('/');
        }
      }
    } catch {
      toast.error('حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Dynamically import firebase to avoid issues if not configured
      const { signInWithGoogle } = await import('@/lib/firebase');
      const result = await signInWithGoogle();
      if (!result) {
        toast.error('تم إلغاء تسجيل الدخول بـ Google');
        return;
      }

      // Exchange Firebase token for app JWT
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: result.idToken }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.detail || 'فشل التحقق من حساب Google');
        return;
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      toast.success('أهلاً بك!');
      window.location.href = '/';
    } catch (err: any) {
      console.error('Google login error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        toast.error('تم إغلاق نافذة Google');
      } else if (code === 'auth/unauthorized-domain') {
        toast.error('هذا النطاق غير مصرح به في إعدادات Firebase');
      } else if (code.includes('invalid')) {
        toast.error('حدث خطأ في إعدادات Google. استخدم البريد وكلمة المرور');
      } else {
        toast.error('حدث خطأ أثناء تسجيل الدخول بـ Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" dir="rtl" data-testid="auth-page">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 px-5 pb-14 pt-safe-header text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/mecca-hero.webp')] bg-cover bg-center" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="h-16 w-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="text-3xl">🕌</span>
          </div>
          <h1 className="text-3xl font-bold font-arabic text-white mb-1">المؤذن العالمي</h1>
          <p className="text-white/70 text-sm">رفيقك الروحي في كل وقت</p>
        </motion.div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="flex-1 px-5 pt-6 max-w-md mx-auto w-full">
        {/* Tabs */}
        <div className="flex bg-muted rounded-2xl p-1 mb-6" data-testid="auth-tabs">
          {(['login', 'signup'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setIsLogin(tab === 'login')}
              data-testid={`auth-tab-${tab}`}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isLogin === (tab === 'login')
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {tab === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
            </button>
          ))}
        </div>

        {/* Google Login */}
        <motion.button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          whileTap={{ scale: 0.98 }}
          data-testid="google-login-btn"
          className="w-full flex items-center justify-center gap-3 bg-card border border-border rounded-2xl py-3 mb-4 hover:bg-accent/50 transition-all active:scale-[0.98]"
        >
          {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span className="font-medium text-sm">متابعة بـ Google</span>
        </motion.button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">أو</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email Form */}
        <motion.form
          onSubmit={handleEmailAuth}
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="auth-form"
        >
          {!isLogin && (
            <div className="relative">
              <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="الاسم الكامل"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pe-9 rounded-2xl h-12 bg-card"
                data-testid="auth-name-input"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pe-9 rounded-2xl h-12 bg-card"
              required
              data-testid="auth-email-input"
            />
          </div>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pe-9 rounded-2xl h-12 bg-card"
              required
              minLength={6}
              data-testid="auth-password-input"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base"
            disabled={loading}
            data-testid="auth-submit-btn"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? 'دخول' : 'إنشاء حساب'}
          </Button>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب؟'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold"
            data-testid="auth-toggle-mode"
          >
            {isLogin ? 'سجّل الآن' : 'ادخل الآن'}
          </button>
        </p>

        <div className="mt-6 p-4 bg-emerald-500/5 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground font-arabic leading-relaxed">
            معظم الميزات تعمل بدون تسجيل دخول<br/>
            <span className="text-emerald-600">التسجيل يتيح مزامنة بياناتك عبر أجهزتك</span>
          </p>
        </div>
      </div>
    </div>
  );
}

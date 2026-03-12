import { Moon, Sun, SunMoon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, mode, toggle } = useTheme();

  const icons = {
    dark: Moon,
    light: Sun,
    auto: SunMoon,
  };
  const Icon = icons[mode];

  return (
    <button
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label={`الوضع الحالي: ${mode === 'auto' ? 'تلقائي' : mode === 'dark' ? 'ليلي' : 'نهاري'}`}
      className={cn(
        'relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500',
        theme === 'dark'
          ? 'bg-[#0a2a1c] border border-emerald-700/50 shadow-[0_0_12px_hsl(155,65%,30%,0.2)]'
          : 'bg-amber-50 border border-amber-200 shadow-[0_0_12px_hsl(42,85%,55%,0.15)]'
      )}
    >
      <span
        className={cn(
          'absolute h-6 w-6 rounded-full transition-all duration-500 flex items-center justify-center',
          theme === 'dark'
            ? 'translate-x-1 bg-emerald-500 shadow-[0_0_10px_hsl(155,65%,42%,0.6)]'
            : 'translate-x-9 bg-amber-400 shadow-[0_0_10px_hsl(42,85%,55%,0.6)]'
        )}
      >
        <Icon className={cn(
          'h-3.5 w-3.5',
          theme === 'dark' ? 'text-emerald-950' : 'text-amber-900'
        )} />
      </span>
      {mode === 'auto' && (
        <span className={cn(
          'absolute -top-1 -right-1 h-3 w-3 rounded-full border-2',
          theme === 'dark' ? 'bg-emerald-400 border-[#0a2a1c]' : 'bg-amber-400 border-amber-50'
        )} />
      )}
    </button>
  );
}

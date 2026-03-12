import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEME_KEY = 'almuadhin_theme';

function getEffective(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark'; // default to dark for Islamic app
}

function apply(theme: 'dark' | 'light') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

// Initialize on load
apply(getEffective());

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => getEffective() === 'dark');

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    apply(next);
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggle}
      data-testid="theme-toggle"
      className={cn(
        'relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300',
        isDark ? 'bg-emerald-800/60 border border-emerald-700/50' : 'bg-amber-100 border border-amber-200'
      )}
    >
      <span
        className={cn(
          'absolute h-6 w-6 rounded-full transition-all duration-300 flex items-center justify-center',
          isDark
            ? 'translate-x-1 bg-emerald-400 shadow-[0_0_8px_hsl(155,65%,42%,0.5)]'
            : 'translate-x-9 bg-amber-400 shadow-[0_0_8px_hsl(42,85%,55%,0.5)]'
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5 text-emerald-900" /> : <Sun className="h-3.5 w-3.5 text-amber-900" />}
      </span>
    </button>
  );
}

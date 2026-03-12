/**
 * ThemeProvider - Dual Islamic theme with auto sunrise/sunset switching
 * Light (Day): Warm cream/gold with Arabesque patterns
 * Dark (Night): Deep navy/emerald with starry elements
 * Auto mode: switches based on actual sunrise/sunset from prayer times
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark'; // effective theme
  mode: ThemeMode; // user preference
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  mode: 'auto',
  setMode: () => {},
  toggle: () => {},
});

const THEME_KEY = 'almuadhin_theme';
const SUNRISE_KEY = 'last_sunrise_time';
const SUNSET_KEY = 'last_sunset_time';

function applyThemeToDOM(theme: 'dark' | 'light') {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0a1a14' : '#f8f5f0');
  }
}

function getSavedMode(): ThemeMode {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  return 'auto';
}

/** Determine if it's currently daytime based on sunrise/sunset */
function isDaytime(): boolean {
  const sunrise = localStorage.getItem(SUNRISE_KEY);
  const sunset = localStorage.getItem(SUNSET_KEY);
  if (!sunrise || !sunset) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = sunrise.split(':').map(Number);
  const [eh, em] = sunset.split(':').map(Number);
  const sunriseMinutes = sh * 60 + sm;
  const sunsetMinutes = eh * 60 + em;

  return currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes;
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  // Auto mode: use sunrise/sunset
  return isDaytime() ? 'light' : 'dark';
}

// Initialize immediately to prevent flash
const initialMode = getSavedMode();
const initialTheme = resolveTheme(initialMode);
applyThemeToDOM(initialTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  const setMode = useCallback((newMode: ThemeMode) => {
    localStorage.setItem(THEME_KEY, newMode);
    setModeState(newMode);
    const resolved = resolveTheme(newMode);
    setTheme(resolved);
    applyThemeToDOM(resolved);
  }, []);

  const toggle = useCallback(() => {
    // Cycle: auto → light → dark → auto
    const next: Record<ThemeMode, ThemeMode> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    };
    setMode(next[mode]);
  }, [mode, setMode]);

  // Auto-check every minute for sunrise/sunset changes
  useEffect(() => {
    if (mode !== 'auto') return;

    const check = () => {
      const resolved = resolveTheme('auto');
      setTheme((prev) => {
        if (prev !== resolved) {
          applyThemeToDOM(resolved);
          return resolved;
        }
        return prev;
      });
    };

    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [mode]);

  // Listen for prayer times updates to get sunrise/sunset
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sunrise) localStorage.setItem(SUNRISE_KEY, detail.sunrise);
      if (detail?.sunset) localStorage.setItem(SUNSET_KEY, detail.sunset);
      if (mode === 'auto') {
        const resolved = resolveTheme('auto');
        setTheme(resolved);
        applyThemeToDOM(resolved);
      }
    };
    window.addEventListener('prayer-times-updated', handler);
    return () => window.removeEventListener('prayer-times-updated', handler);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Update sunrise/sunset times (called from prayer context) */
export function updateSunriseSunset(sunrise: string, sunset: string) {
  if (sunrise) localStorage.setItem(SUNRISE_KEY, sunrise);
  if (sunset) localStorage.setItem(SUNSET_KEY, sunset);
  window.dispatchEvent(
    new CustomEvent('prayer-times-updated', { detail: { sunrise, sunset } })
  );
}

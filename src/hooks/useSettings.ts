import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useSettings() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  // Apply theme class on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return { theme, toggleTheme };
}

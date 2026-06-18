import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-[0_14px_34px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-4 focus:ring-brand-100 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:shadow-[0_14px_34px_rgba(0,0,0,0.28)] dark:hover:border-brand-500 dark:hover:text-cyan-200 dark:focus:ring-brand-900/50 ${className}`}
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}

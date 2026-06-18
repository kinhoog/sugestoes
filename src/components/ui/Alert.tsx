import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertTone = 'error' | 'success' | 'info';

const toneClasses: Record<AlertTone, string> = {
  error: 'border-red-100 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100',
  success:
    'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100',
  info: 'border-brand-100 bg-brand-50 text-brand-900 dark:border-brand-500/30 dark:bg-brand-900/40 dark:text-cyan-100',
};

const icons: Record<AlertTone, ReactNode> = {
  error: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />,
  success: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />,
  info: <Info className="mt-0.5 h-4 w-4 shrink-0" />,
};

interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', children, className = '' }: AlertProps) {
  return (
    <div
      className={`portal-alert portal-alert-${tone} notice-enter flex gap-2 rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClasses[tone]} ${className}`}
    >
      {icons[tone]}
      <div>{children}</div>
    </div>
  );
}

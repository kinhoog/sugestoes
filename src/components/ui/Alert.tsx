import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertTone = 'error' | 'success' | 'info';

const toneClasses: Record<AlertTone, string> = {
  error: 'border-red-100 bg-red-50 text-red-800',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-800',
  info: 'border-brand-100 bg-brand-50 text-brand-900',
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
      className={`notice-enter flex gap-2 rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClasses[tone]} ${className}`}
    >
      {icons[tone]}
      <div>{children}</div>
    </div>
  );
}

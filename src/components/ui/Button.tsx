import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white shadow-[0_16px_32px_rgba(18,95,157,0.22)] hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-[0_20px_42px_rgba(18,95,157,0.28)] active:translate-y-0 dark:bg-brand-600 dark:hover:bg-brand-500 dark:shadow-[0_16px_38px_rgba(36,151,227,0.22)]',
  secondary:
    'border border-brand-100 bg-white text-brand-800 shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-100 dark:shadow-[0_14px_32px_rgba(0,0,0,0.28)] dark:hover:border-brand-500 dark:hover:bg-slate-800',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger: 'bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', icon, children, className = '', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 motion-reduce:transition-none dark:focus:ring-brand-900/50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function ButtonLink({
  to,
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-brand-100 motion-reduce:transition-none dark:focus:ring-brand-900/50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}

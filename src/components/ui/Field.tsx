import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface FieldShellProps {
  label: string;
  helper?: string;
  children: ReactNode;
}

function FieldShell({ label, helper, children }: FieldShellProps) {
  return (
    <label className="group block">
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
      {helper ? (
        <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
          {helper}
        </span>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const controlClass =
  'w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-brand-200 hover:bg-white focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[0_10px_26px_rgba(0,0,0,0.22)] dark:placeholder:text-slate-500 dark:hover:border-brand-500 dark:hover:bg-slate-900 dark:focus:border-brand-400 dark:focus:bg-slate-900 dark:focus:ring-brand-900/50 dark:disabled:bg-slate-800 dark:disabled:text-slate-500';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
}

export function InputField({ label, helper, className = '', ...props }: InputFieldProps) {
  return (
    <FieldShell label={label} helper={helper}>
      <input className={`${controlClass} ${className}`} {...props} />
    </FieldShell>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helper?: string;
}

export function TextareaField({ label, helper, className = '', rows = 5, ...props }: TextareaFieldProps) {
  return (
    <FieldShell label={label} helper={helper}>
      <textarea className={`${controlClass} resize-y ${className}`} rows={rows} {...props} />
    </FieldShell>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helper?: string;
  placeholder?: string;
  options: readonly SelectOption[];
}

export function SelectField({
  label,
  helper,
  placeholder = 'Selecione',
  options,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} helper={helper}>
      <select className={`${controlClass} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

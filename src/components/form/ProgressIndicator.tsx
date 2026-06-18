interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: readonly string[];
}

export function ProgressIndicator({ currentStep, totalSteps, labels }: ProgressIndicatorProps) {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <aside className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-24 dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          Etapa {currentStep + 1} de {totalSteps}
        </span>
        <span className="font-medium text-brand-700 dark:text-cyan-200">{progress}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-cyan-500 to-emerald-400 transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="mt-5 space-y-2">
        {labels.map((label, index) => {
          const active = index === currentStep;
          const complete = index < currentStep;

          return (
            <li
              key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 motion-reduce:transition-none ${
                  active
                  ? 'bg-brand-50 text-brand-900 shadow-[0_10px_30px_rgba(21,120,194,0.12)] dark:bg-brand-900/50 dark:text-cyan-100 dark:shadow-[0_14px_34px_rgba(0,0,0,0.24)]'
                  : complete
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                  active
                    ? 'bg-brand-700 text-white'
                    : complete
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {complete ? '✓' : index + 1}
              </span>
              <span className="line-clamp-1">{label}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';

import { BrandLogo } from '../BrandLogo';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  variant?: 'default' | 'register';
  initialModalOpen?: boolean;
}

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

const HERO_TITLE = 'onde há retrabalho,\npode existir automação.';
const serviceOptions = ['retrabalho', 'planilhas/e-mails', 'gargalo', 'automação', 'outro'] as const;

function useTypewriter(text: string, speed = 38, startDelay = 600): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let timeoutId: number | undefined;
    let cancelled = false;

    function typeNext(index: number) {
      if (cancelled) {
        return;
      }

      const nextIndex = index + 1;
      setDisplayed(text.slice(0, nextIndex));

      if (nextIndex >= text.length) {
        setDone(true);
        return;
      }

      timeoutId = window.setTimeout(() => typeNext(nextIndex), speed);
    }

    timeoutId = window.setTimeout(() => typeNext(0), startDelay);

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [speed, startDelay, text]);

  return { displayed, done };
}

function HeroCharacter() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      video.pause();
      setVideoComplete(true);
      return undefined;
    }

    setVideoComplete(false);
    video.play().catch(() => undefined);

    return () => {
      video.pause();
    };
  }, []);

  function handleVideoEnded() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    setVideoComplete(true);

    if (Number.isFinite(video.duration)) {
      video.currentTime = Math.max(video.duration - 0.05, 0);
    }
  }

  return (
    <div className="pointer-events-none absolute right-[-13vw] top-[88px] z-0 hidden h-[calc(100dvh-100px)] min-h-[540px] w-[54vw] max-w-[840px] overflow-visible bg-transparent lg:block">
      <div className="absolute left-[22%] top-[18%] h-[390px] w-[390px] rounded-full bg-cyan-300/20 blur-3xl animate-glow-pulse" />
      <div className={`absolute right-0 top-[-1%] h-full w-full bg-transparent will-change-transform ${videoComplete ? '' : 'animate-float-soft'}`}>
        {videoFailed ? (
          <div className="absolute right-[3%] top-[16%] h-[430px] w-[430px] rounded-full bg-[radial-gradient(circle_at_40%_34%,rgba(255,255,255,0.95),rgba(103,232,249,0.22)_36%,rgba(20,105,168,0.12)_64%,transparent_76%)]" />
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              preload="metadata"
              onEnded={handleVideoEnded}
              onError={() => setVideoFailed(true)}
              className="auth-hero-character-video relative z-10 h-full w-full -scale-x-100 object-contain object-right-center opacity-95"
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
            <div className="absolute inset-y-0 left-0 z-20 w-[18%] bg-gradient-to-r from-white via-white/80 to-transparent" />
            <div className="absolute inset-y-0 right-0 z-20 w-[34%] bg-gradient-to-l from-white via-white/78 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-20 h-[18%] bg-gradient-to-t from-white via-white/76 to-transparent" />
          </>
        )}
      </div>
    </div>
  );
}

export function AuthLayout({
  title,
  description,
  children,
  variant = 'default',
  initialModalOpen = false,
}: AuthLayoutProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(initialModalOpen || variant === 'register');
  const [services, setServices] = useState<string[]>([]);
  const { displayed, done } = useTypewriter(HERO_TITLE);

  useEffect(() => {
    if (initialModalOpen || variant === 'register') {
      setIsAuthModalOpen(true);
    }
  }, [initialModalOpen, variant]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirstField = () => {
      const firstInput = document.querySelector<HTMLElement>(
        '#auth-modal input[autocomplete="email"], #auth-modal input:not([type="hidden"])',
      );
      firstInput?.focus({ preventScroll: true });
    };
    const firstFocusTimerId = window.setTimeout(focusFirstField, 80);
    const secondFocusTimerId = window.setTimeout(focusFirstField, 220);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAuthModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(firstFocusTimerId);
      window.clearTimeout(secondFocusTimerId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen]);

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function openAuthModal() {
    setIsAuthModalOpen(true);
  }

  return (
    <div className="auth-public-light relative min-h-dvh overflow-hidden bg-white font-sans text-black antialiased selection:bg-[#EAECE9] selection:text-[#1C2E1E]">
      <HeroCharacter />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-14">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
            <img src="./logosite.png" alt="eProtege" className="h-8 w-8 object-contain" />
          </span>
          <span className="text-[21px] font-medium tracking-tight text-black sm:text-[26px]">
            eprotege®
          </span>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isAuthModalOpen}
          onClick={openAuthModal}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-[#1C6EA4]/25 hover:text-[#1C6EA4] hover:shadow-[0_16px_34px_rgba(28,110,164,0.12)] focus:outline-none focus:ring-4 focus:ring-[#1C6EA4]/10 motion-reduce:transition-none sm:text-base"
        >
          acessar sistema
        </button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-76px)] w-full max-w-7xl grid-cols-1 items-center px-6 pb-10 pt-8 lg:grid-cols-[minmax(600px,0.9fr)_minmax(0,1.1fr)] lg:px-16 lg:pb-10 lg:pt-0">
        <section className="relative z-10 max-w-[660px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="min-h-[2.1em] whitespace-pre-line text-5xl font-normal leading-[1.05] tracking-tight text-black sm:whitespace-pre sm:text-6xl lg:text-[58px] xl:text-[62px]">
              {displayed}
              {!done ? (
                <span className="inline-block h-[1.05em] w-[2px] translate-y-[0.08em] bg-black align-middle ml-1 animate-blink" />
              ) : null}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 max-w-xl text-lg font-normal leading-8 text-[#5A635A] md:text-xl"
          >
            registre gargalos, retrabalhos e processos manuais para análise de oportunidades de
            automação interna e ia aplicada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-medium tracking-tight text-black">qual tipo de demanda?</h2>
            <p className="mt-2 text-sm text-[#738273]">
              selecione só para visualizar o tipo de problema
            </p>

            <div className="mt-6 flex max-w-xl flex-wrap gap-3">
              {serviceOptions.map((service) => {
                const active = services.includes(service);

                return (
                  <motion.button
                    key={service}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleService(service)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all motion-reduce:transition-none ${
                      active
                        ? 'bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5'
                        : 'border border-[#F1F3F1] bg-white text-[#1C2E1E] shadow-[0_8px_22px_rgba(15,23,42,0.04)] hover:bg-[#F1F3F1]/55'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Check size={16} />
                      </motion.span>
                    ) : null}
                    {service}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 min-h-[58px] max-w-xl">
              <AnimatePresence mode="wait">
                {services.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs italic text-black/45"
                  >
                    clique para selecionar os tipos acima.
                  </motion.p>
                ) : (
                  <motion.div
                    key="selected"
                    initial={{ opacity: 0, height: 0, y: 8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 rounded-2xl border border-[#E8EDE7] bg-[#FAFBF9] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#1C2E1E]">
                        pronto para registrar: {services.join(', ')}
                      </p>
                      <button
                        type="button"
                        onClick={openAuthModal}
                        className="text-left text-xs font-bold uppercase tracking-[0.16em] text-[#4D6D47]"
                      >
                        começar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        <section className="hidden lg:block" aria-hidden="true" />
      </main>

      <AnimatePresence>
        {isAuthModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-md"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsAuthModalOpen(false);
              }
            }}
          >
            <motion.section
              id="auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[2rem] border border-black/10 bg-white p-6 text-neutral-900 shadow-2xl shadow-black/20 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:border-[#1C6EA4]/25 hover:text-[#1C6EA4] focus:outline-none focus:ring-4 focus:ring-[#1C6EA4]/10"
                aria-label="Fechar autenticação"
              >
                <X size={17} />
              </button>

              <div className={variant === 'register' ? 'mb-4 pr-8' : 'mb-6 pr-8'}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                    <BrandLogo className="h-8" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4D6D47]">
                      acesso corporativo
                    </p>
                    <p className="text-sm text-neutral-500">eProtege</p>
                  </div>
                </div>
                <h2
                  id="auth-modal-title"
                  className={variant === 'register' ? 'text-xl font-semibold text-black' : 'text-2xl font-semibold text-black'}
                >
                  {title}
                </h2>
                <p className={variant === 'register' ? 'mt-1.5 text-sm leading-5 text-neutral-600' : 'mt-2 text-sm leading-6 text-neutral-600'}>
                  {description}
                </p>
              </div>

              {children}
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

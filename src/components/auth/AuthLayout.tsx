import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';

import { BrandLogo } from '../BrandLogo';
import { ThemeToggle } from '../ThemeToggle';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  variant?: 'default' | 'register';
}

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

const navItems = ['sistema', 'demandas', 'automação', 'melhorias'] as const;
const serviceOptions = ['retrabalho', 'planilhas/e-mails', 'gargalo', 'automação', 'outro'] as const;

function useTypewriter(text: string, speed = 38, startDelay = 600): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let index = 0;
    let intervalId: number | undefined;

    const delayId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));

        if (index >= text.length) {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(delayId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [speed, startDelay, text]);

  return { displayed, done };
}

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      video.pause();
      return undefined;
    }

    video.play().catch(() => undefined);

    return () => {
      video.pause();
    };
  }, []);

  return (
    <div className="pointer-events-none order-last relative h-48 w-full overflow-hidden bg-neutral-50 sm:h-64 lg:order-none lg:absolute lg:inset-y-0 lg:left-0 lg:z-0 lg:h-full lg:w-[58vw] lg:bg-transparent">
      <div className="absolute left-[-28%] bottom-[2%] h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl animate-glow-pulse sm:h-80 sm:w-80 lg:left-[-22%] lg:bottom-[8%] lg:h-[420px] lg:w-[420px]" />
      <div className="absolute left-[-16%] bottom-[-16%] h-64 w-[82vw] max-w-[520px] animate-float-soft will-change-transform sm:bottom-[-20%] sm:h-80 lg:left-[-10%] lg:bottom-[4%] lg:h-[66vh] lg:w-[60vw] lg:max-w-[760px]">
        {videoFailed ? (
          <div className="h-full w-full rounded-[48%] bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.9),rgba(103,232,249,0.24)_38%,rgba(20,105,168,0.18)_68%,transparent_78%)]" />
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-contain object-left-bottom opacity-80 lg:opacity-90"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/45 to-transparent lg:bg-gradient-to-r lg:from-white/95 lg:via-white/68 lg:to-transparent" />
    </div>
  );
}

export function AuthLayout({
  title,
  description,
  children,
  variant = 'default',
}: AuthLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const { displayed, done } = useTypewriter('registre gargalos\ne transforme rotinas.');
  const isRegister = variant === 'register';

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function focusAuthForm() {
    document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen">
      <BackgroundVideo />

      <header className="fixed top-0 inset-x-0 z-20 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/85 shadow-[0_12px_34px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur">
            <img src="./logosite.png" alt="eProtege" className="h-8 w-8 object-contain" />
          </span>
          <span className="text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none">
            eprotege®
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1">
            &#10033;
          </span>
        </div>

        <nav className="hidden md:flex text-[23px] text-black">
          {navItems.map((item, index) => (
            <span key={item}>
              <button type="button" onClick={focusAuthForm} className="hover:opacity-60 transition-opacity">
                {item}
              </button>
              {index < navItems.length - 1 ? <span className="opacity-40">,&nbsp;</span> : null}
            </span>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={focusAuthForm}
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
          >
            acessar sistema
          </button>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="relative z-20 flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full bg-white/85 shadow-[0_10px_28px_rgba(15,23,42,0.08)] md:hidden"
          aria-label="Abrir menu"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex min-h-screen flex-col justify-center px-8 text-4xl font-medium text-black">
          {[...navItems, 'acessar'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                focusAuthForm();
              }}
              className="border-b border-black/10 py-5 text-left"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-white lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">
        <main
          id="spade-hero"
          className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center"
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center pt-24 lg:pt-16">
            <section>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-[76px] font-normal tracking-tight text-black leading-[1.08] mb-8 select-none w-full whitespace-pre-wrap">
                  {displayed}
                  {!done ? (
                    <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
                  ) : null}
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <p className="text-lg md:text-xl text-[#5A635A] leading-relaxed font-normal mb-14 max-w-2xl">
                  registre retrabalhos, gargalos operacionais e rotinas manuais <br />
                  para análise de oportunidades de automação interna.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
              >
                <h2 className="text-2xl font-medium tracking-tight mb-2">qual tipo de demanda?</h2>
                <p className="opacity-85 text-[#738273] mb-8">
                  selecione só para visualizar o tipo de problema
                </p>

                <div className="flex flex-wrap gap-3">
                  {serviceOptions.map((service) => {
                    const active = services.includes(service);

                    return (
                      <motion.button
                        key={service}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleService(service)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                          active
                            ? 'bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5 transform'
                            : 'bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55'
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

                <div className="mt-6 min-h-[58px]">
                  <AnimatePresence mode="wait">
                    {services.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="opacity-50 italic text-xs"
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
                        <div className="flex flex-col gap-3 rounded-2xl border border-[#E8EDE7] bg-[#FAFBF9] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-[#1C2E1E]">
                            pronto para registrar: {services.join(', ')}
                          </p>
                          <button
                            type="button"
                            onClick={focusAuthForm}
                            className="text-left text-[#4D6D47] uppercase text-xs font-bold tracking-[0.16em]"
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

            <motion.section
              id="auth-card"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="relative rounded-[2rem] border border-black/5 bg-white/85 backdrop-blur-xl shadow-2xl shadow-black/10 p-6 sm:p-8">
                <div className={isRegister ? 'mb-4' : 'mb-6'}>
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
                  <h2 className={isRegister ? 'text-xl font-semibold text-black' : 'text-2xl font-semibold text-black'}>
                    {title}
                  </h2>
                  <p className={isRegister ? 'mt-1.5 text-sm leading-5 text-neutral-600' : 'mt-2 text-sm leading-6 text-neutral-600'}>
                    {description}
                  </p>
                </div>
                {children}
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  X,
  Lock,
  Sparkles,
  Trophy,
  RotateCcw,
  Award,
  ArrowRight,
  Users,
  Home
} from 'lucide-react';

// ==========================================
// 1. RECURSOS LOCALES (PNG)
// ==========================================
const PIZZA_IMAGES = ['pepperoni.png', 'hawaiana.png', 'queso.png'] as const;
type PizzaType = typeof PIZZA_IMAGES[number];

const PIZZA_INFO: Record<PizzaType, { label: string; icon: string }> = {
  'pepperoni.png': { label: 'Pepperoni', icon: '🍕' },
  'hawaiana.png': { label: 'Hawaiana', icon: '🍍' },
  'queso.png': { label: 'Queso', icon: '🧀' },
};

// ==========================================
// 2. AUDIO SINTETIZADO (Web Audio API)
//    Música Italiana de Mandolina + Campana de Cocina
// ==========================================
class ItalianPizzeriaAudioEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;
  public musicEnabled = true;
  private musicInterval: number | null = null;
  private musicMasterGain: GainNode | null = null;
  private sfxMasterGain: GainNode | null = null;
  private isMusicPlaying = false;
  private currentStep = 0;

  // Tarantella Napolitana en 6/8
  private melodyNotes: { melody: number; bass: number }[] = [
    { melody: 523.25, bass: 130.81 }, // C5, C3
    { melody: 392.00, bass: 0 },      // G4
    { melody: 329.63, bass: 0 },      // E4
    { melody: 523.25, bass: 196.00 }, // C5, G3
    { melody: 392.00, bass: 0 },      // G4
    { melody: 329.63, bass: 0 },      // E4
    { melody: 659.25, bass: 130.81 }, // E5, C3
    { melody: 587.33, bass: 0 },      // D5
    { melody: 523.25, bass: 0 },      // C5
    { melody: 493.88, bass: 196.00 }, // B4, G3
    { melody: 523.25, bass: 0 },      // C5
    { melody: 587.33, bass: 0 },      // D5
    { melody: 587.33, bass: 196.00 }, // D5, G3
    { melody: 493.88, bass: 0 },      // B4
    { melody: 392.00, bass: 0 },      // G4
    { melody: 698.46, bass: 146.83 }, // F5, D3
    { melody: 587.33, bass: 0 },      // D5
    { melody: 493.88, bass: 0 },      // B4
    { melody: 587.33, bass: 196.00 }, // D5, G3
    { melody: 523.25, bass: 0 },      // C5
    { melody: 493.88, bass: 0 },      // B4
    { melody: 440.00, bass: 196.00 }, // A4, G3
    { melody: 493.88, bass: 0 },      // B4
    { melody: 587.33, bass: 0 },      // D5
    { melody: 698.46, bass: 174.61 }, // F5, F3
    { melody: 523.25, bass: 0 },      // C5
    { melody: 440.00, bass: 0 },      // A4
    { melody: 698.46, bass: 130.81 }, // F5, C3
    { melody: 523.25, bass: 0 },      // C5
    { melody: 440.00, bass: 0 },      // A4
    { melody: 659.25, bass: 130.81 }, // E5, C3
    { melody: 523.25, bass: 0 },      // C5
    { melody: 392.00, bass: 0 },      // G4
    { melody: 523.25, bass: 196.00 }, // C5, G3
    { melody: 392.00, bass: 0 },      // G4
    { melody: 329.63, bass: 0 },      // E4
    { melody: 587.33, bass: 196.00 }, // D5, G3
    { melody: 493.88, bass: 0 },      // B4
    { melody: 392.00, bass: 0 },      // G4
    { melody: 493.88, bass: 146.83 }, // B4, D3
    { melody: 587.33, bass: 0 },      // D5
    { melody: 493.88, bass: 0 },      // B4
    { melody: 523.25, bass: 130.81 }, // C5, C3
    { melody: 392.00, bass: 0 },      // G4
    { melody: 523.25, bass: 0 },      // C5
    { melody: 523.25, bass: 130.81 }, // C5
    { melody: 0, bass: 0 },
    { melody: 0, bass: 0 },
  ];

  public init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicMasterGain = this.ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.sfxMasterGain = this.ctx.createGain();
      this.sfxMasterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.musicMasterGain.connect(this.ctx.destination);
      this.sfxMasterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startItalianMusic() {
    this.init();
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentStep = 0;

    const stepIntervalMs = 175;
    this.musicInterval = window.setInterval(() => {
      this.playMusicStep();
    }, stepIntervalMs);
  }

  public stopItalianMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopItalianMusic();
      return false;
    } else {
      this.startItalianMusic();
      return true;
    }
  }

  private playMusicStep() {
    if (!this.ctx || !this.musicMasterGain || !this.musicEnabled) return;
    const note = this.melodyNotes[this.currentStep];
    const time = this.ctx.currentTime;

    if (note.melody > 0) {
      this.triggerMandolinPluck(note.melody, time, 0.22);
      this.triggerMandolinPluck(note.melody * 1.002, time + 0.015, 0.16);
    }
    if (note.bass > 0) {
      this.triggerBassPluck(note.bass, time, 0.26);
    }

    this.currentStep = (this.currentStep + 1) % this.melodyNotes.length;
  }

  private triggerMandolinPluck(freq: number, time: number, volume: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(3.0, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private triggerBassPluck(freq: number, time: number, volume: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(time);
    osc.stop(time + 0.36);
  }

  // Campana dulce de cocina al entrar
  public playKitchenBell() {
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;
    const now = this.ctx.currentTime;
    [1568, 2352, 3136].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      const vol = 0.24 / (idx + 1);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain!);
      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  public playPop(freq = 440) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playSliceCut() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.12);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playChew() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playVictoryChime() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + 0.39);
    });
  }

  public playBoxClose() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playWhoosh() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

const audio = new ItalianPizzeriaAudioEngine();

// ==========================================
// 3. CAPA DE CELEBRACIÓN CON CONFETI
// ==========================================
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'star';
  delay: number;
}

const ConfettiOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  const particles = useMemo<ConfettiParticle[]>(() => {
    if (!active) return [];
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    const arr: ConfettiParticle[] = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        id: i,
        x: Math.random() * 96 + 2,
        y: Math.random() * 20 - 25,
        size: Math.random() * 10 + 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.4 ? 'star' : 'circle',
        delay: Math.random() * 0.45,
      });
    }
    return arr;
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {particles.map((p) => (
          <g
            key={p.id}
            className="animate-confetti"
            style={{
              transformOrigin: `${p.x}% ${p.y}%`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.shape === 'circle' ? (
              <circle cx={`${p.x}%`} cy={`${p.y}%`} r={p.size / 2} fill={p.color} />
            ) : (
              <path
                d="M0,-8 L2.4,-2.4 L8,-2.4 L3.6,1.2 L5.2,7.2 L0,3.6 L-5.2,7.2 L-3.6,1.2 L-8,-2.4 L-2.4,-2.4 Z"
                fill={p.color}
                transform={`translate(${p.x * 10}, ${p.y * 10}) scale(${p.size / 10})`}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// 4. PANTALLA DE BIENVENIDA (SPLASH SCREEN / MENÚ DE INICIO)
// ==========================================
interface WelcomeSplashScreenProps {
  onStart: () => void;
  isClosing: boolean;
}

const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({ onStart, isClosing }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Efecto de partículas de estrellitas suaves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars: { x: number; y: number; r: number; alpha: number; speed: number; pulse: number }[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.35 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((s) => {
        s.y -= s.speed;
        s.pulse += 0.04;
        if (s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }

        const currentAlpha = Math.max(0.2, Math.min(0.9, s.alpha + Math.sin(s.pulse) * 0.3));

        ctx.fillStyle = `rgba(255, 235, 120, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 2) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 2.2, s.y);
          ctx.lineTo(s.x + s.r * 2.2, s.y);
          ctx.moveTo(s.x, s.y - s.r * 2.2);
          ctx.lineTo(s.x, s.y + s.r * 2.2);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-[#fef08a] via-[#fde047] to-[#f59e0b] flex flex-col items-center justify-between p-4 select-none overflow-hidden transition-all duration-500 ${
        isClosing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Canvas de destellos y estrellitas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* PIZZAS FLOTANTES ATENUADAS EN EL FONDO (opacity: 0.16 a 0.18) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="pepperoni.png"
          alt=""
          className="absolute -top-10 -left-12 w-44 sm:w-64 opacity-[0.16] animate-float-pizza-1 select-none"
        />
        <img
          src="hawaiana.png"
          alt=""
          className="absolute -bottom-14 -left-8 w-48 sm:w-72 opacity-[0.18] animate-float-pizza-2 select-none"
        />
        <img
          src="queso.png"
          alt=""
          className="absolute -top-12 -right-10 w-52 sm:w-72 opacity-[0.17] animate-float-pizza-3 select-none"
        />
        <img
          src="pepperoni.png"
          alt=""
          className="absolute -bottom-12 -right-12 w-48 sm:w-64 opacity-[0.16] animate-float-pizza-1 select-none"
        />
      </div>

      {/* ENCABEZADO Y TÍTULO PRINCIPAL (LIMPIO SIN LÍNEAS NI SUBRAYADOS) */}
      <div className="relative z-20 flex flex-col items-center text-center mt-2 sm:mt-6 max-w-xl">
        <div className="inline-flex items-center gap-2 bg-white/95 border-3 border-slate-900 rounded-full px-4 py-1.5 shadow-[3px_3px_0_#0f172a] mb-2 sm:mb-3 animate-wobble">
          <span className="text-xl sm:text-2xl">🍕</span>
          <span className="text-xs sm:text-sm font-black uppercase text-amber-900 tracking-wider">
            La Pizzería Más Divertida
          </span>
          <span className="text-xl sm:text-2xl">⭐</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tight drop-shadow-sm leading-tight select-none">
          ¡Bienvenidos a la <br className="hidden sm:inline" />
          <span className="text-amber-900 drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]">
            Pizzería de Altair!
          </span>
        </h1>
        <p className="mt-1.5 text-xs sm:text-base font-bold text-slate-800 max-w-md px-2 select-none">
          ¡Aprende fracciones cortando, sumando y compartiendo deliciosas pizzas!
        </p>
      </div>

      {/* ALTAIR CENTRAL CON ALTAIROJO.PNG (AMPLIO Y PROTAGÓNICO) */}
      <div className="relative z-20 flex flex-col items-center my-auto">
        <div className="relative group">
          <div className="w-40 h-40 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full bg-white/95 border-4 sm:border-5 border-slate-900 p-2 sm:p-3 shadow-[6px_6px_0_#0f172a] flex items-center justify-center animate-float">
            <img
              src="altairojo.png"
              alt="Chef Altair"
              className="w-full h-full object-contain select-none drop-shadow-md animate-wobble"
            />
          </div>
          <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-amber-400 border-3 border-slate-900 rounded-2xl p-1.5 sm:p-2 shadow-[3px_3px_0_#0f172a] animate-bounce">
            <span className="text-2xl sm:text-3xl">👨‍🍳</span>
          </div>
        </div>

        <div className="mt-3 bg-white/95 border-3 border-slate-900 rounded-2xl py-1 px-4 shadow-[3px_3px_0_#0f172a] text-xs sm:text-sm font-black text-slate-900">
          Chef Anfitrión Altair ✨
        </div>
      </div>

      {/* BOTÓN CENTRAL ARCADE */}
      <div className="relative z-20 flex flex-col items-center mb-4 sm:mb-8 w-full max-w-sm px-4">
        <button
          onClick={onStart}
          className="w-full py-3.5 sm:py-4 px-6 bg-emerald-500 hover:bg-emerald-400 active:translate-y-1 active:shadow-[2px_2px_0_#0f172a] text-white border-4 border-slate-900 rounded-3xl font-black text-lg sm:text-2xl shadow-[6px_6px_0_#0f172a] transition-all transform hover:scale-[1.03] flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-2xl sm:text-3xl animate-bounce">🍕</span>
          <span>¡ENTRAR A LA PIZZERÍA!</span>
          <span className="text-2xl sm:text-3xl animate-bounce">🚀</span>
        </button>
        <span className="text-[11px] sm:text-xs font-bold text-slate-800 mt-2 text-center opacity-90">
          Toca el botón para encender el horno y la música italiana 🎶
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 5. AVATAR DE ALTAIR EN LA BARRA DE JUEGO
// ==========================================
interface AltairAvatarProps {
  emotion: 'idle' | 'celebrate' | 'eating';
  speech?: string;
  badge?: React.ReactNode;
}

const AltairAvatar: React.FC<AltairAvatarProps> = ({ emotion, speech, badge }) => {
  const [idleState, setIdleState] = useState<'cerrada' | 'sonrisa'>('cerrada');

  useEffect(() => {
    if (emotion !== 'idle') return;
    const interval = setInterval(() => {
      setIdleState((prev) => (prev === 'cerrada' ? 'sonrisa' : 'cerrada'));
    }, 2800);
    return () => clearInterval(interval);
  }, [emotion]);

  let currentImg: string;
  if (emotion === 'celebrate') {
    currentImg = 'altairojo.png';
  } else if (emotion === 'eating') {
    currentImg = 'altairsonrisa.png';
  } else {
    currentImg = idleState === 'sonrisa' ? 'altairsonrisa.png' : 'altaircerrada.png';
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3.5 select-none w-full min-w-0">
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="w-[95px] h-[95px] sm:w-[138px] sm:h-[138px] rounded-3xl bg-amber-300/40 border-3 sm:border-4 border-slate-900 p-1 flex items-center justify-center shadow-[3px_3px_0_#0f172a] overflow-hidden bg-gradient-to-b from-amber-100 to-amber-200">
          <img
            src={currentImg}
            alt="Chef Altair"
            className={`w-full h-full object-contain drop-shadow-md select-none transition-transform duration-300 ${
              emotion === 'celebrate' ? 'scale-115 -rotate-3 animate-bounce' : 'hover:scale-105'
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        {emotion === 'celebrate' && (
          <div className="absolute -top-2 -right-2 text-xl sm:text-2xl animate-bounce">⭐</div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="bg-white border-2 sm:border-3 border-slate-900 rounded-2xl sm:rounded-3xl p-2 sm:p-3 text-xs sm:text-base font-bold text-slate-800 shadow-[3px_3px_0px_#0f172a] relative leading-snug">
          <div className="absolute left-[-8px] top-6 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-slate-900" />
          <div className="absolute left-[-6px] top-6 w-0 h-0 border-t-5 border-t-transparent border-b-5 border-b-transparent border-r-7 border-r-white" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-900">{speech}</span>
            {badge && <div className="inline-block mt-0.5">{badge}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. SECTOR DE REBANADA LIMPIA
// ==========================================
export type SliceState = 'present' | 'empty_shadow' | 'unused';

interface SliceSectorProps {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  pizzaImage: PizzaType;
  state: SliceState;
  sliceIndex: number;
  onClick?: (sliceIndex: number) => void;
  separationOffset?: number;
}

const SliceSector: React.FC<SliceSectorProps> = ({
  id,
  cx,
  cy,
  radius,
  startAngle,
  endAngle,
  pizzaImage,
  state,
  sliceIndex,
  onClick,
  separationOffset = 0,
}) => {
  const midAngle = (startAngle + endAngle) / 2;
  const offX = separationOffset * Math.cos(midAngle);
  const offY = separationOffset * Math.sin(midAngle);

  const curCx = cx + offX;
  const curCy = cy + offY;

  const x1 = curCx + radius * Math.cos(startAngle);
  const y1 = curCy + radius * Math.sin(startAngle);
  const x2 = curCx + radius * Math.cos(endAngle);
  const y2 = curCy + radius * Math.sin(endAngle);
  const diff = endAngle - startAngle;
  const largeArc = diff > Math.PI ? 1 : 0;
  const path = `M ${curCx.toFixed(2)} ${curCy.toFixed(2)} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

  const clipId = `clip-${id}`;
  const fx = curCx + radius * 0.58 * Math.cos(midAngle);
  const fy = curCy + radius * 0.58 * Math.sin(midAngle);

  if (state === 'empty_shadow') {
    return (
      <g
        className="cursor-pointer transition-opacity hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(sliceIndex);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <path d={path} fill="#fef9c3" opacity="0.45" />
        <path d={path} fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeDasharray="4 3" />
        <text
          x={fx}
          y={fy + 4}
          textAnchor="middle"
          fontSize="11"
          fill="#64748b"
          fontWeight="bold"
          className="pointer-events-none select-none opacity-70"
        >
          ↩️
        </text>
      </g>
    );
  }

  if (state === 'unused') {
    return (
      <path
        d={path}
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="opacity-50"
      />
    );
  }

  return (
    <g
      className="cursor-pointer transition-transform duration-[1500ms] ease-out hover:scale-[1.02] active:scale-95"
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(sliceIndex);
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>
      <path d={path} fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
      <image
        href={pizzaImage}
        x={curCx - radius}
        y={curCy - radius}
        width={radius * 2}
        height={radius * 2}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <path
        d={path}
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.8"
        strokeLinejoin="round"
        className="pointer-events-none"
      />
    </g>
  );
};

// ==========================================
// 8. COMPONENTE DE PLATO DE PIZZA
// ==========================================
interface PizzaPlateComponentProps {
  totalSlices: number;
  sliceStates: SliceState[];
  pizzaImage: PizzaType;
  onSliceClick?: (index: number) => void;
  size?: number;
  separationOffset?: number;
}

const PizzaPlateComponent: React.FC<PizzaPlateComponentProps> = ({
  totalSlices,
  sliceStates,
  pizzaImage,
  onSliceClick,
  size = 140,
  separationOffset = 0,
}) => {
  const cx = 80;
  const cy = 80;
  const radius = 64;
  const sliceAngle = (2 * Math.PI) / totalSlices;

  return (
    <div
      className="relative select-none max-w-full aspect-square flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none touch-none">
        <circle cx={cx} cy={cy} r={radius + 10} fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
        <circle cx={cx} cy={cy} r={radius + 3} fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />

        {Array.from({ length: totalSlices }).map((_, i) => {
          const sa = i * sliceAngle - Math.PI / 2;
          const ea = (i + 1) * sliceAngle - Math.PI / 2;
          const st = sliceStates[i] || 'unused';

          return (
            <SliceSector
              key={`sl-${totalSlices}-${i}`}
              id={`pl-${totalSlices}-${i}`}
              cx={cx}
              cy={cy}
              radius={radius}
              startAngle={sa}
              endAngle={ea}
              pizzaImage={pizzaImage}
              state={st}
              sliceIndex={i}
              onClick={onSliceClick}
              separationOffset={separationOffset}
            />
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 9. MODO CORTE ASISTIDO (LÍNEAS LUMINOSAS + REPARTO)
// ==========================================
interface CutLineDef {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angleDeg: number;
}

interface SlicingPizzaBoardProps {
  totalSlices: number;
  pizzaImage: PizzaType;
  onAllCutsCompleted: () => void;
  isCompleted: boolean;
  size: number;
  currentLineIdx: number;
  setCurrentLineIdx: React.Dispatch<React.SetStateAction<number>>;
  completedLines: boolean[];
  setCompletedLines: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const SlicingPizzaBoard: React.FC<SlicingPizzaBoardProps> = ({
  totalSlices,
  pizzaImage,
  onAllCutsCompleted,
  isCompleted,
  size,
  currentLineIdx,
  setCurrentLineIdx,
  completedLines,
  setCompletedLines,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const cx = 100;
  const cy = 100;
  const radius = 78;

  const cutLines = useMemo<CutLineDef[]>(() => {
    const lines: CutLineDef[] = [];
    if (totalSlices === 2) {
      lines.push({
        x1: cx,
        y1: cy - radius,
        x2: cx,
        y2: cy + radius,
        angleDeg: 180,
      });
    } else if (totalSlices === 3) {
      const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
      angles.forEach((rad) => {
        lines.push({
          x1: cx,
          y1: cy,
          x2: cx + radius * Math.cos(rad),
          y2: cy + radius * Math.sin(rad),
          angleDeg: (rad * 180) / Math.PI + 90,
        });
      });
    } else if (totalSlices === 4) {
      lines.push({
        x1: cx,
        y1: cy - radius,
        x2: cx,
        y2: cy + radius,
        angleDeg: 180,
      });
      lines.push({
        x1: cx - radius,
        y1: cy,
        x2: cx + radius,
        y2: cy,
        angleDeg: 90,
      });
    } else if (totalSlices === 6) {
      const angles = [Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
      angles.forEach((rad) => {
        lines.push({
          x1: cx - radius * Math.cos(rad),
          y1: cy - radius * Math.sin(rad),
          x2: cx + radius * Math.cos(rad),
          y2: cy + radius * Math.sin(rad),
          angleDeg: (rad * 180) / Math.PI + 90,
        });
      });
    } else if (totalSlices === 8) {
      const angles = [Math.PI / 2, 0, Math.PI / 4, (3 * Math.PI) / 4];
      angles.forEach((rad) => {
        lines.push({
          x1: cx - radius * Math.cos(rad),
          y1: cy - radius * Math.sin(rad),
          x2: cx + radius * Math.cos(rad),
          y2: cy + radius * Math.sin(rad),
          angleDeg: (rad * 180) / Math.PI + 90,
        });
      });
    }
    return lines;
  }, [totalSlices]);

  const activeLine = cutLines[currentLineIdx] || null;

  const currentCutProgress = isDragging ? dragProgress : 0;
  const cutterX = activeLine
    ? activeLine.x1 + (activeLine.x2 - activeLine.x1) * currentCutProgress
    : 0;
  const cutterY = activeLine
    ? activeLine.y1 + (activeLine.y2 - activeLine.y1) * currentCutProgress
    : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCompleted || !activeLine) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const distToStart = Math.hypot(local.x - activeLine.x1, local.y - activeLine.y1);
    if (distToStart < 35) {
      setIsDragging(true);
      setDragProgress(0);
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      audio.playPop(520);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !activeLine || isCompleted) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const dx = activeLine.x2 - activeLine.x1;
    const dy = activeLine.y2 - activeLine.y1;
    const lineLenSq = dx * dx + dy * dy;

    const proj =
      ((local.x - activeLine.x1) * dx + (local.y - activeLine.y1) * dy) / lineLenSq;
    const prog = Math.max(0, Math.min(1, proj));
    setDragProgress(prog);

    if (prog > 0.86) {
      setIsDragging(false);
      setDragProgress(0);
      audio.playSliceCut();

      const nextCompleted = [...completedLines];
      nextCompleted[currentLineIdx] = true;
      setCompletedLines(nextCompleted);

      if (currentLineIdx + 1 < cutLines.length) {
        setCurrentLineIdx((prev) => prev + 1);
        audio.playPop(580);
      } else {
        onAllCutsCompleted();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setDragProgress(0);
  };

  const sliceAngle = (2 * Math.PI) / totalSlices;
  const separationOffset = isCompleted ? 14 : 0;

  return (
    <div
      className="relative select-none max-w-full aspect-square flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <circle cx={cx} cy={cy} r={radius + 14} fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
        <circle
          cx={cx}
          cy={cy}
          r={radius + 5}
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeDasharray="8 5"
        />

        {Array.from({ length: totalSlices }).map((_, i) => {
          const sa = i * sliceAngle - Math.PI / 2;
          const ea = (i + 1) * sliceAngle - Math.PI / 2;
          return (
            <SliceSector
              key={`cut-sl-${totalSlices}-${i}`}
              id={`cut-sec-${totalSlices}-${i}`}
              cx={cx}
              cy={cy}
              radius={radius}
              startAngle={sa}
              endAngle={ea}
              pizzaImage={pizzaImage}
              state="present"
              sliceIndex={i}
              separationOffset={separationOffset}
            />
          );
        })}

        {!isCompleted &&
          cutLines.map((l, idx) => {
            if (completedLines[idx]) {
              return (
                <line
                  key={`done-line-${idx}`}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="#0f172a"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              );
            }
            return null;
          })}

        {!isCompleted && activeLine && (
          <g className="cursor-grab active:cursor-grabbing">
            {/* Zona táctil extendida para asistencia motriz */}
            <line
              x1={activeLine.x1}
              y1={activeLine.y1}
              x2={activeLine.x2}
              y2={activeLine.y2}
              stroke="transparent"
              strokeWidth="48"
            />
            {/* Guía luminosa dorada */}
            <line
              x1={activeLine.x1}
              y1={activeLine.y1}
              x2={activeLine.x2}
              y2={activeLine.y2}
              stroke="#fbbf24"
              strokeWidth="6"
              opacity="0.8"
              strokeLinecap="round"
            />
            {/* Guía punteada indicadora */}
            <line
              x1={activeLine.x1}
              y1={activeLine.y1}
              x2={activeLine.x2}
              y2={activeLine.y2}
              stroke="#ef4444"
              strokeWidth="3.2"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />

            {/* Estela luminosa de apertura que sigue al dedo en tiempo real */}
            {dragProgress > 0 && (
              <>
                <line
                  x1={activeLine.x1}
                  y1={activeLine.y1}
                  x2={cutterX}
                  y2={cutterY}
                  stroke="#fef08a"
                  strokeWidth="9"
                  opacity="0.85"
                  strokeLinecap="round"
                />
                <line
                  x1={activeLine.x1}
                  y1={activeLine.y1}
                  x2={cutterX}
                  y2={cutterY}
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Círculo sutil que indica el punto de inicio */}
            {dragProgress < 0.12 && (
              <g className="animate-pulse pointer-events-none">
                <circle
                  cx={activeLine.x1}
                  cy={activeLine.y1}
                  r={14}
                  fill="#fbbf24"
                  opacity="0.45"
                />
                <circle
                  cx={activeLine.x1}
                  cy={activeLine.y1}
                  r={7.5}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                />
                <circle cx={activeLine.x1} cy={activeLine.y1} r={2.5} fill="#ffffff" />
                <text
                  x={activeLine.x1}
                  y={activeLine.y1 > cy ? activeLine.y1 + 16 : activeLine.y1 - 10}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="9.5"
                  fontWeight="900"
                  className="select-none bg-white/90 px-1 py-0.5 rounded drop-shadow-sm"
                >
                  Toca y arrastra
                </text>
              </g>
            )}

            {/* Estela / punto luminoso debajo del dedo (SIN rodillo ni rueda de corte) */}
            {dragProgress > 0 && (
              <g transform={`translate(${cutterX}, ${cutterY})`} className="pointer-events-none">
                <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity="0.45" />
                <circle cx="0" cy="0" r="7.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

// ==========================================
// 10. CAJA DE PIZZA CON ENTREGA Y VUELO
// ==========================================
interface InteractiveDeliveryBoxProps {
  totalSlices: number;
  sliceStates: SliceState[];
  pizzaImage: PizzaType;
  label: string;
  size?: number;
  deliveryState: 'idle' | 'closing' | 'flying' | 'delivered';
  onSliceClick?: (index: number) => void;
  onDeliverClick?: () => void;
  canDeliverManually?: boolean;
  onNewOperation?: () => void;
}

const InteractiveDeliveryBox: React.FC<InteractiveDeliveryBoxProps> = ({
  totalSlices,
  sliceStates,
  pizzaImage,
  label,
  size = 145,
  deliveryState,
  onSliceClick,
  onDeliverClick,
  canDeliverManually = false,
  onNewOperation,
}) => {
  return (
    <div className="relative flex flex-col items-center shrink-0">
      <div
        className={`relative flex flex-col items-center bg-amber-100 border-3 sm:border-4 border-slate-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-[3px_3px_0_#0f172a] transition-all duration-300 ${
          deliveryState === 'flying' ? 'animate-box-fly z-50' : ''
        }`}
        style={{ width: size + 20 }}
      >
        <div className="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-wide mb-0.5 flex items-center gap-1">
          <span>📦</span>
          <span className="truncate">{label}</span>
        </div>

        <div className="relative rounded-xl bg-amber-50/90 p-0.5 border-2 border-dashed border-amber-300 flex items-center justify-center overflow-hidden">
          <PizzaPlateComponent
            totalSlices={totalSlices}
            sliceStates={sliceStates}
            pizzaImage={pizzaImage}
            onSliceClick={deliveryState === 'idle' ? onSliceClick : undefined}
            size={size}
          />

          {(deliveryState === 'closing' || deliveryState === 'flying') && (
            <div className="absolute inset-0 bg-[#eab308] border-3 sm:border-4 border-slate-900 rounded-xl flex flex-col items-center justify-center p-2 animate-lid-close z-30 shadow-[inset_0_0_8px_rgba(180,83,9,0.3)]">
              <div className="w-full h-full border border-dashed border-amber-800 rounded-lg flex flex-col items-center justify-center text-center p-1 bg-[#fde047]">
                <span className="text-xl sm:text-2xl animate-bounce">🍕</span>
                <span className="text-[10px] sm:text-xs font-black tracking-wider text-slate-900 uppercase">
                  Pizzería de Altair
                </span>
                <div className="mt-0.5 text-[8px] sm:text-[9px] font-black text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-700">
                  ✔ ¡EMPACADO!
                </div>
              </div>
            </div>
          )}

          {deliveryState === 'delivered' && (
            <div className="absolute inset-0 bg-emerald-500/95 border-3 sm:border-4 border-slate-900 rounded-xl flex flex-col items-center justify-center p-2 z-40 text-center text-white shadow-lg">
              <span className="text-2xl sm:text-3xl animate-bounce">⭐</span>
              <span className="text-[11px] sm:text-xs font-black uppercase mt-0.5">
                ¡Pedido Entregado!
              </span>
              <span className="text-[9px] font-bold text-emerald-100 mb-1">
                ¡Cliente 100% satisfecho!
              </span>
              {onNewOperation && (
                <button
                  onClick={onNewOperation}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 border-2 border-slate-900 rounded-xl font-black text-xs shadow-[2px_2px_0_#0f172a] active:translate-y-0.5"
                >
                  🍕 Siguiente
                </button>
              )}
            </div>
          )}
        </div>

        {canDeliverManually && deliveryState === 'idle' && (
          <button
            onClick={onDeliverClick}
            className="mt-1 w-full py-0.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] sm:text-xs rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 animate-pulse flex items-center justify-center gap-1"
          >
            <span>🛵</span>
            <span>¡Entregar Orden!</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 11. MODAL DE TROFEOS Y LOGROS
// ==========================================
interface UserStats {
  slicesCut: number;
  sumsSolved: number;
  restasSolved: number;
  advSolved: number;
  missionsCompleted: number;
  batchesCompleted: number;
  deliveries: number;
  stars: number;
}

const INITIAL_STATS: UserStats = {
  slicesCut: 0,
  sumsSolved: 0,
  restasSolved: 0,
  advSolved: 0,
  missionsCompleted: 0,
  batchesCompleted: 0,
  deliveries: 0,
  stars: 10,
};

interface TrophyDef {
  key: string;
  title: string;
  desc: string;
  icon: string;
  category: 'corte' | 'operaciones' | 'maestria';
  target: number;
  getCurrent: (s: UserStats) => number;
  unit: string;
}

const TROPHIES_CATALOG: TrophyDef[] = [
  {
    key: 'first_cut',
    title: 'Primer Reparto',
    desc: 'Corta tu primera pizza para invitados.',
    icon: '🍕',
    category: 'corte',
    target: 1,
    getCurrent: (s) => s.slicesCut,
    unit: 'reparto',
  },
  {
    key: 'master_slicer',
    title: 'Maestro Cortador',
    desc: 'Realiza 5 cortes perfectos con asistencia.',
    icon: '✂️',
    category: 'corte',
    target: 5,
    getCurrent: (s) => s.slicesCut,
    unit: 'cortes',
  },
  {
    key: 'first_sum',
    title: 'Chef de la Suma',
    desc: 'Transfiere y empaca tu primera suma.',
    icon: '➕',
    category: 'operaciones',
    target: 1,
    getCurrent: (s) => s.sumsSolved,
    unit: 'suma',
  },
  {
    key: 'sum_collector',
    title: 'Coleccionista de Rebanadas',
    desc: 'Resuelve 5 sumas homogéneas.',
    icon: '📦',
    category: 'operaciones',
    target: 5,
    getCurrent: (s) => s.sumsSolved,
    unit: 'sumas',
  },
  {
    key: 'first_resta',
    title: 'Primer Mordisco',
    desc: 'Come tus primeras rebanadas en Restas.',
    icon: '😋',
    category: 'operaciones',
    target: 1,
    getCurrent: (s) => s.restasSolved,
    unit: 'resta',
  },
  {
    key: 'adv_master',
    title: 'Científico de Fracciones',
    desc: 'Resuelve 3 sumas avanzadas con corte.',
    icon: '⚡',
    category: 'operaciones',
    target: 3,
    getCurrent: (s) => s.advSolved,
    unit: 'avanzadas',
  },
  {
    key: 'first_mission',
    title: 'Repartidor Veloz',
    desc: 'Completa tu primera comanda de cliente.',
    icon: '🛵',
    category: 'maestria',
    target: 1,
    getCurrent: (s) => s.missionsCompleted,
    unit: 'misión',
  },
  {
    key: 'galaxy_chef',
    title: 'Gran Maestro de Altair',
    desc: 'Acumula 30 estrellas de oro en la pizzería.',
    icon: '👑',
    category: 'maestria',
    target: 30,
    getCurrent: (s) => s.stars,
    unit: 'estrellas',
  },
];

const TrophyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}> = ({ isOpen, onClose, stats }) => {
  const [filter, setFilter] = useState<'all' | 'corte' | 'operaciones' | 'maestria'>('all');

  if (!isOpen) return null;

  const filtered = TROPHIES_CATALOG.filter((t) => filter === 'all' || t.category === filter);
  const unlockedCount = TROPHIES_CATALOG.filter((t) => t.getCurrent(stats) >= t.target).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-white border-4 border-slate-900 rounded-3xl max-w-lg w-full p-3 sm:p-5 shadow-[6px_6px_0_#0f172a] max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between border-b-3 border-slate-900 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🏆</span>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 leading-none">
                Vitrina de Trofeos
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-amber-700">
                {unlockedCount} de {TROPHIES_CATALOG.length} Logrados • ⭐ {stats.stars} Estrellas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-slate-900 rounded-xl"
          >
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'corte', label: '🍕 Reparto' },
            { id: 'operaciones', label: '➕ Operaciones' },
            { id: 'maestria', label: '👑 Maestría' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFilter(cat.id as typeof filter);
                audio.playPop(520);
              }}
              className={`px-2.5 py-0.5 rounded-xl text-xs font-black border-2 border-slate-900 shrink-0 ${
                filter === cat.id
                  ? 'bg-amber-400 text-slate-900 shadow-[1px_1px_0_#0f172a]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0">
          {filtered.map((t) => {
            const current = t.getCurrent(stats);
            const isUnlocked = current >= t.target;
            const pct = Math.min(100, Math.round((current / t.target) * 100));

            return (
              <div
                key={t.key}
                className={`p-2 sm:p-2.5 rounded-2xl border-2 sm:border-3 border-slate-900 flex items-center gap-2.5 ${
                  isUnlocked ? 'bg-amber-100 shadow-[2px_2px_0_#0f172a]' : 'bg-slate-50 opacity-80'
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl border-2 border-slate-900 shrink-0 ${
                    isUnlocked ? 'bg-amber-300' : 'bg-slate-200 grayscale'
                  }`}
                >
                  {isUnlocked ? t.icon : <Lock className="w-4 h-4 text-slate-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{t.title}</h4>
                    {isUnlocked ? (
                      <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.2 rounded border border-slate-900">
                        ¡LOGRADO!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">
                        {current}/{t.target} {t.unit}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-semibold leading-tight line-clamp-1">
                    {t.desc}
                  </p>
                  {!isUnlocked && (
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 border border-slate-400 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 12. GENERADOR DE MISIONES
// ==========================================
export interface ProceduralMission {
  id: string;
  type: 'sum' | 'resta' | 'equiv' | 'combo';
  clientName: string;
  clientIcon: string;
  orderText: string;
  den: number;
  p1Count?: number;
  p2Count?: number;
  targetCount: number;
  equivP2Count?: number;
}

const CLIENT_NAMES = [
  { name: 'Monstruo Luca', icon: '👾' },
  { name: 'Dino Mateo', icon: '🦖' },
  { name: 'Robot Bip', icon: '🤖' },
  { name: 'Gatito Miau', icon: '🐱' },
  { name: 'Osito Bruno', icon: '🐻' },
];

function generateProceduralBatch(batchNum: number): ProceduralMission[] {
  const getClient = (offset: number) => CLIENT_NAMES[(batchNum * 2 + offset) % CLIENT_NAMES.length];

  const den1 = [4, 6, 8][batchNum % 3];
  const c1 = getClient(0);
  const m1: ProceduralMission = {
    id: `b${batchNum}-m1`,
    type: 'sum',
    clientName: c1.name,
    clientIcon: c1.icon,
    orderText: `Comanda #1: Empaca 1/${den1} del Plato 1 y 2/${den1} del Plato 2 en la caja.`,
    den: den1,
    p1Count: 1,
    p2Count: 2,
    targetCount: 3,
  };

  const c2 = getClient(1);
  const m2: ProceduralMission = {
    id: `b${batchNum}-m2`,
    type: 'resta',
    clientName: c2.name,
    clientIcon: c2.icon,
    orderText: `Comanda #2: ¡Tengo mucha hambre! Toca 2 rebanadas para que me las coma.`,
    den: 6,
    p1Count: 5,
    targetCount: 2,
  };

  const c3 = getClient(2);
  const m3: ProceduralMission = {
    id: `b${batchNum}-m3`,
    type: 'combo',
    clientName: c3.name,
    clientIcon: c3.icon,
    orderText: `Comanda #3: Empaca 2/8 de Pepperoni y 3/8 de Queso en la caja.`,
    den: 8,
    p1Count: 2,
    p2Count: 3,
    targetCount: 5,
  };

  const c4 = getClient(3);
  const m4: ProceduralMission = {
    id: `b${batchNum}-m4`,
    type: 'equiv',
    clientName: c4.name,
    clientIcon: c4.icon,
    orderText: `Comanda #4: Corta la rebanada de 1/2 en cuartos y empácalas en la caja.`,
    den: 4,
    p1Count: 2,
    equivP2Count: 1,
    targetCount: 3,
  };

  const c5 = getClient(4);
  const m5: ProceduralMission = {
    id: `b${batchNum}-m5`,
    type: 'combo',
    clientName: c5.name,
    clientIcon: c5.icon,
    orderText: `Comanda #5: ¡Gran Banquete! Empaca 3/8 y 4/8 en la caja de entrega.`,
    den: 8,
    p1Count: 3,
    p2Count: 4,
    targetCount: 7,
  };

  return [m1, m2, m3, m4, m5];
}

const SHARING_OPTIONS = [
  { guests: 2, fraction: '1/2', name: 'medios', label: '2 invitados' },
  { guests: 3, fraction: '1/3', name: 'tercios', label: '3 amigos' },
  { guests: 4, fraction: '1/4', name: 'cuartos', label: '4 amigos' },
  { guests: 6, fraction: '1/6', name: 'sextos', label: '6 personas' },
  { guests: 8, fraction: '1/8', name: 'octavos', label: '8 personas' },
];

// ==========================================
// 13. COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  // PANTALLA DE BIENVENIDA
  const [showWelcome, setShowWelcome] = useState(true);
  const [isClosingWelcome, setIsClosingWelcome] = useState(false);

  // Soporte PWA para instalación en Android / Chrome
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        audio.playVictoryChime();
        triggerCelebration('¡Aplicación instalada con éxito en tu pantalla de inicio! 📲🎉');
      }
    } catch {}
    setDeferredPrompt(null);
  };

  const [selectedPizza, setSelectedPizza] = useState<PizzaType>('pepperoni.png');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Pestañas (1: Cortar, 2: Sumas, 3: Restas, 4: Avanzadas, 5: Misiones)
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Avatar Altair
  const [altairEmotion, setAltairEmotion] = useState<'idle' | 'celebrate' | 'eating'>('idle');
  const [altairSpeech, setAltairSpeech] = useState<string>('');

  // Estadísticas persistentes
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('altair_user_stats_v5');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STATS;
  });

  const incrementStat = (field: keyof UserStats, delta = 1) => {
    setStats((prev) => {
      const updated = { ...prev, [field]: (prev[field] as number) + delta };
      try {
        localStorage.setItem('altair_user_stats_v5', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const triggerCelebration = (speechMsg: string) => {
    setAltairEmotion('celebrate');
    setAltairSpeech(speechMsg);
    setShowConfetti(true);
    audio.playVictoryChime();
    setTimeout(() => {
      setShowConfetti(false);
      setAltairEmotion('idle');
    }, 3200);
  };

  // Entrada a la Pizzería desde la Pantalla de Bienvenida
  const handleStartFromWelcome = () => {
    audio.playKitchenBell();
    if (audio.musicEnabled && !isMusicPlaying) {
      audio.startItalianMusic();
      setIsMusicPlaying(true);
    }
    setIsClosingWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setIsClosingWelcome(false);
    }, 450);
  };

  // ----------------------------------------
  // MODO 1: CORTAR (REPARTO CON CORTE ASISTIDO)
  // ----------------------------------------
  const [cutChallengeIdx, setCutChallengeIdx] = useState(2); // Por defecto: 4 personas (cuartos)
  const currentSharing = SHARING_OPTIONS[cutChallengeIdx];
  const [cutCompleted, setCutCompleted] = useState(false);
  const [cutCurrentLine, setCutCurrentLine] = useState(0);
  const [cutLinesDone, setCutLinesDone] = useState<boolean[]>([]);

  const startCutChallenge = (idx: number) => {
    setCutChallengeIdx(idx);
    setCutCompleted(false);
    setCutCurrentLine(0);
    setCutLinesDone([]);
    const item = SHARING_OPTIONS[idx];
    setAltairSpeech(
      `¡Tenemos ${item.guests} invitados en la mesa! Ayúdame a cortar la pizza en ${item.guests} partes iguales (${item.name}). Toca el punto rojo y arrastra tu dedo.`
    );
    audio.playPop(500);
  };

  const nextRandomCutChallenge = () => {
    let nextIdx = Math.floor(Math.random() * SHARING_OPTIONS.length);
    if (nextIdx === cutChallengeIdx) {
      nextIdx = (nextIdx + 1) % SHARING_OPTIONS.length;
    }
    startCutChallenge(nextIdx);
  };

  const handleAllCutsDone = () => {
    setCutCompleted(true);
    incrementStat('slicesCut', 1);
    incrementStat('stars', 2);
    triggerCelebration(
      `¡Excelente trabajo! Cortaste la pizza en ${currentSharing.guests} partes iguales. Ahora cada amigo tiene exactamente ${currentSharing.fraction} de pizza del mismo tamaño y a todos les toca la misma cantidad.`
    );
  };

  // ----------------------------------------
  // MODO 2: SUMAS CON HUELLA VACÍA Y CAJA
  // ----------------------------------------
  const [sumDen, setSumDen] = useState<number>(8);
  const [p1Total, setP1Total] = useState<number>(2);
  const [p2Total, setP2Total] = useState<number>(2);
  const [p1Transferred, setP1Transferred] = useState<boolean[]>([false, false]);
  const [p2Transferred, setP2Transferred] = useState<boolean[]>([false, false]);
  const [sumDeliveryState, setSumDeliveryState] = useState<'idle' | 'closing' | 'flying' | 'delivered'>('idle');

  const inBoxCount = p1Transferred.filter(Boolean).length + p2Transferred.filter(Boolean).length;
  const targetSumTotal = p1Total + p2Total;
  const isSumComplete = inBoxCount === targetSumTotal;

  const resetSumState = (newDen: number, newP1: number, newP2: number) => {
    setSumDen(newDen);
    setP1Total(newP1);
    setP2Total(newP2);
    setP1Transferred(Array(newP1).fill(false));
    setP2Transferred(Array(newP2).fill(false));
    setSumDeliveryState('idle');
    setAltairEmotion('idle');
    setAltairSpeech('¡Hola! Pasa las rebanadas de los dos platos a la caja para sumar las pizzas.');
  };

  const newRandomSum = () => {
    const den = [4, 6, 8][Math.floor(Math.random() * 3)];
    const p1 = Math.floor(Math.random() * (den / 2)) + 1;
    const p2 = Math.floor(Math.random() * (den / 2)) + 1;
    resetSumState(den, p1, p2);
    audio.playPop(480);
  };

  const toggleSliceP1 = (sliceIndex: number) => {
    if (sliceIndex >= p1Total || sumDeliveryState !== 'idle') return;
    const next = [...p1Transferred];
    next[sliceIndex] = !next[sliceIndex];
    setP1Transferred(next);

    audio.playPop(next[sliceIndex] ? 440 : 350);
    const newInBox = next.filter(Boolean).length + p2Transferred.filter(Boolean).length;
    if (newInBox === targetSumTotal) {
      handleSumComplete();
    } else {
      setAltairSpeech(`Llevas ${newInBox}/${sumDen} en la caja. Pasa las que faltan para completar la suma.`);
    }
  };

  const toggleSliceP2 = (sliceIndex: number) => {
    if (sliceIndex >= p2Total || sumDeliveryState !== 'idle') return;
    const next = [...p2Transferred];
    next[sliceIndex] = !next[sliceIndex];
    setP2Transferred(next);

    audio.playPop(next[sliceIndex] ? 460 : 370);
    const newInBox = p1Transferred.filter(Boolean).length + next.filter(Boolean).length;
    if (newInBox === targetSumTotal) {
      handleSumComplete();
    } else {
      setAltairSpeech(`Llevas ${newInBox}/${sumDen} en la caja. Pasa las que faltan para completar la suma.`);
    }
  };

  const handleSumComplete = () => {
    incrementStat('sumsSolved', 1);
    incrementStat('stars', 2);
    triggerCelebration('¡Excelente trabajo! Has completado el pedido a la perfección.');

    setSumDeliveryState('closing');
    audio.playBoxClose();

    setTimeout(() => {
      setSumDeliveryState('flying');
      audio.playWhoosh();
    }, 700);

    setTimeout(() => {
      setSumDeliveryState('delivered');
      incrementStat('deliveries', 1);
    }, 2000);
  };

  // ----------------------------------------
  // MODO 3: RESTAS (COMER CON ALTAIR)
  // ----------------------------------------
  const [resDen, setResDen] = useState(8);
  const [resStart, setResStart] = useState(6);
  const [resToEat, setResToEat] = useState(2);
  const [resEatenIndices, setResEatenIndices] = useState<number[]>([]);

  const newRandomResta = () => {
    const den = [4, 6, 8][Math.floor(Math.random() * 3)];
    const start = Math.floor(Math.random() * (den - 2)) + 3;
    const eat = Math.floor(Math.random() * (start - 1)) + 1;
    setResDen(den);
    setResStart(start);
    setResToEat(eat);
    setResEatenIndices([]);
    setAltairEmotion('idle');
    setAltairSpeech(`¡Tengo mucha hambre! Toca ${eat} rebanadas para que me las coma y veamos cuántas quedan.`);
    audio.playPop(480);
  };

  const handleSliceClickResta = (sliceIndex: number) => {
    if (sliceIndex >= resStart) return;

    let updated: number[];
    if (resEatenIndices.includes(sliceIndex)) {
      updated = resEatenIndices.filter((idx) => idx !== sliceIndex);
      audio.playPop(340);
    } else {
      if (resEatenIndices.length >= resToEat) return;
      updated = [...resEatenIndices, sliceIndex];
      audio.playChew();
      setAltairEmotion('eating');
      setTimeout(() => setAltairEmotion('idle'), 400);
    }

    setResEatenIndices(updated);
    if (updated.length === resToEat) {
      incrementStat('restasSolved', 1);
      incrementStat('stars', 2);
      triggerCelebration('¡Excelente trabajo! Has completado el pedido a la perfección.');
    } else {
      setAltairSpeech(`¡Qué rica pizza! Has comido ${updated.length} de ${resToEat}. Faltan ${resToEat - updated.length}.`);
    }
  };

  // ----------------------------------------
  // MODO 4: AVANZADAS (CORTE DE 1/2)
  // ----------------------------------------
  const [advCutDone, setAdvCutDone] = useState(false);
  const [advP1Transferred, setAdvP1Transferred] = useState<boolean[]>([false, false]);
  const [advP2Transferred, setAdvP2Transferred] = useState<boolean[]>([false]);
  const [advDeliveryState, setAdvDeliveryState] = useState<'idle' | 'closing' | 'flying' | 'delivered'>('idle');

  const handleAdvCut = () => {
    setAdvCutDone(true);
    audio.playSliceCut();
    setAltairEmotion('celebrate');
    setAltairSpeech('¡Genial! Ahora tienen el mismo tamaño. Pásalas a la caja para sumarlas.');
    setTimeout(() => setAltairEmotion('idle'), 2200);
  };

  const toggleAdvP1 = (sliceIndex: number) => {
    if (!advCutDone) {
      audio.playPop(300);
      setAltairSpeech('¡Ojo! Estas rebanadas son de tamaños diferentes. Primero emparejemos los trozos antes de juntarlos.');
      return;
    }
    const next = [...advP1Transferred];
    next[sliceIndex] = !next[sliceIndex];
    setAdvP1Transferred(next);
    audio.playPop(next[sliceIndex] ? 450 : 340);
    checkAdvComplete(next, advP2Transferred);
  };

  const toggleAdvP2 = (sliceIndex: number) => {
    if (!advCutDone) {
      audio.playPop(300);
      setAltairSpeech('¡Ojo! Estas rebanadas son de tamaños diferentes. Primero emparejemos los trozos antes de juntarlos.');
      return;
    }
    const next = [...advP2Transferred];
    next[sliceIndex] = !next[sliceIndex];
    setAdvP2Transferred(next);
    audio.playPop(next[sliceIndex] ? 470 : 360);
    checkAdvComplete(advP1Transferred, next);
  };

  const checkAdvComplete = (p1Arr: boolean[], p2Arr: boolean[]) => {
    const inBox = p1Arr.filter(Boolean).length + p2Arr.filter(Boolean).length;
    if (inBox === 3) {
      incrementStat('advSolved', 1);
      incrementStat('stars', 3);
      triggerCelebration('¡Excelente trabajo! Has completado el pedido a la perfección.');
      setAdvDeliveryState('closing');
      audio.playBoxClose();
      setTimeout(() => {
        setAdvDeliveryState('flying');
        audio.playWhoosh();
      }, 700);
      setTimeout(() => {
        setAdvDeliveryState('delivered');
        incrementStat('deliveries', 1);
      }, 2000);
    }
  };

  const resetAdvState = () => {
    setAdvCutDone(false);
    setAdvP1Transferred([false, false]);
    setAdvP2Transferred([false]);
    setAdvDeliveryState('idle');
    setAltairSpeech('¡Ojo! Estas rebanadas son de tamaños diferentes. Primero emparejemos los trozos antes de juntarlos.');
    audio.playPop(460);
  };

  // ----------------------------------------
  // MODO 5: MISIONES (LOTES DE 5)
  // ----------------------------------------
  const [batchIndex, setBatchIndex] = useState(1);
  const [batchMissions, setBatchMissions] = useState<ProceduralMission[]>(() => generateProceduralBatch(1));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [batchCompleted, setBatchCompleted] = useState(false);
  const [missionDeliveryState, setMissionDeliveryState] = useState<'idle' | 'closing' | 'flying' | 'delivered'>('idle');

  const [mP1Trans, setMP1Trans] = useState<boolean[]>([]);
  const [mP2Trans, setMP2Trans] = useState<boolean[]>([]);
  const [mEatenIndices, setMEatenIndices] = useState<number[]>([]);
  const [mCutDone, setMCutDone] = useState(false);

  const currentMission = batchMissions[currentStepIndex] || batchMissions[0];

  const resetCurrentStepState = (m: ProceduralMission) => {
    setMissionDeliveryState('idle');
    setMCutDone(false);
    setAltairEmotion('idle');
    setAltairSpeech(m.orderText);

    if (m.type === 'sum' || m.type === 'combo') {
      setMP1Trans(Array(m.p1Count || 2).fill(false));
      setMP2Trans(Array(m.p2Count || 1).fill(false));
    } else if (m.type === 'resta') {
      setMEatenIndices([]);
    } else if (m.type === 'equiv') {
      setMP1Trans([false, false]);
      setMP2Trans(Array(m.equivP2Count || 1).fill(false));
    }
  };

  useEffect(() => {
    resetCurrentStepState(currentMission);
  }, [currentStepIndex, batchIndex]);

  const advanceMissionStep = (msg: string) => {
    incrementStat('missionsCompleted', 1);
    incrementStat('stars', 2);
    triggerCelebration(msg);

    if (currentStepIndex === 4) {
      setBatchCompleted(true);
      incrementStat('batchesCompleted', 1);
      incrementStat('stars', 5);
      setAltairSpeech('¡Excelente trabajo! Has completado el turno a la perfección.');
    } else {
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 1500);
    }
  };

  const triggerMissionDelivery = (msg: string) => {
    setMissionDeliveryState('closing');
    audio.playBoxClose();
    setTimeout(() => {
      setMissionDeliveryState('flying');
      audio.playWhoosh();
    }, 700);
    setTimeout(() => {
      setMissionDeliveryState('delivered');
      incrementStat('deliveries', 1);
      advanceMissionStep(msg);
    }, 1800);
  };

  const generateNewBatch = () => {
    const nextBatch = batchIndex + 1;
    setBatchIndex(nextBatch);
    setBatchMissions(generateProceduralBatch(nextBatch));
    setCurrentStepIndex(0);
    setBatchCompleted(false);
    audio.playPop(520);
  };

  useEffect(() => {
    if (activeTab === 1) {
      const item = SHARING_OPTIONS[cutChallengeIdx];
      setAltairSpeech(
        `¡Tenemos ${item.guests} invitados en la mesa! Ayúdame a cortar la pizza en ${item.guests} partes iguales (${item.name}). Toca el punto rojo y arrastra tu dedo.`
      );
    }
  }, []);

  const handleTabChange = (newTab: 1 | 2 | 3 | 4 | 5) => {
    setActiveTab(newTab);
    audio.playPop(500);
    if (newTab === 1) {
      const item = SHARING_OPTIONS[cutChallengeIdx];
      setAltairSpeech(
        `¡Tenemos ${item.guests} invitados en la mesa! Ayúdame a cortar la pizza en ${item.guests} partes iguales (${item.name}). Toca el punto rojo y arrastra tu dedo.`
      );
    } else if (newTab === 2) {
      setAltairSpeech('¡Hola! Pasa las rebanadas de los dos platos a la caja para sumar las pizzas.');
    } else if (newTab === 3) {
      setAltairSpeech(`¡Tengo mucha hambre! Toca ${resToEat} rebanadas para que me las coma y veamos cuántas quedan.`);
    } else if (newTab === 4) {
      setAltairSpeech('¡Ojo! Estas rebanadas son de tamaños diferentes. Primero emparejemos los trozos antes de juntarlos.');
    } else if (newTab === 5) {
      setAltairSpeech(currentMission.orderText);
    }
  };

  const toggleSound = () => {
    audio.soundEnabled = !audio.soundEnabled;
    setIsAudioMuted(!audio.soundEnabled);
  };

  const toggleMusicOnly = () => {
    const playing = audio.toggleMusic();
    setIsMusicPlaying(playing);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#fef08a] flex flex-col justify-between overflow-hidden font-fredoka select-none text-slate-900 relative">
      {/* 1. PANTALLA DE BIENVENIDA (SPLASH SCREEN) */}
      {showWelcome && (
        <WelcomeSplashScreen
          onStart={handleStartFromWelcome}
          isClosing={isClosingWelcome}
        />
      )}

      {/* Capa de confeti animado al celebrar */}
      <ConfettiOverlay active={showConfetti} />

      {/* Modal de Trofeos y Logros */}
      <TrophyModal
        isOpen={isTrophyOpen}
        onClose={() => setIsTrophyOpen(false)}
        stats={stats}
      />

      {/* ==========================================
          CABECERA SUPERIOR ULTRA-COMPACTA
      ========================================== */}
      <header className="bg-white border-b-3 sm:border-b-4 border-slate-900 px-2 sm:px-4 py-1 flex items-center justify-between shrink-0 shadow-[0_3px_0_#0f172a] z-30">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón de inicio para volver a la portada */}
          <button
            onClick={() => {
              setShowWelcome(true);
              audio.playPop(520);
            }}
            className="p-1 sm:p-1.5 bg-amber-100 hover:bg-amber-200 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center justify-center shrink-0"
            title="Volver a la portada de bienvenida"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900" />
          </button>

          <span className="text-xl sm:text-2xl animate-bounce">🍕</span>
          <div>
            <h1 className="text-sm sm:text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">
              Pizzería de Altair
            </h1>
            <p className="text-[9px] sm:text-[11px] font-bold text-amber-800 leading-none">
              Fracciones Táctiles y Corte Real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Selector de Pizza PNG */}
          <div className="flex items-center bg-amber-50 border-2 border-slate-900 rounded-xl p-0.5">
            {PIZZA_IMAGES.map((img) => (
              <button
                key={img}
                onClick={() => {
                  setSelectedPizza(img);
                  audio.playPop(520);
                }}
                className={`px-1.5 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                  selectedPizza === img
                    ? 'bg-amber-400 text-slate-900 shadow-[1px_1px_0_#0f172a]'
                    : 'text-slate-600 hover:bg-amber-100'
                }`}
                title={PIZZA_INFO[img].label}
              >
                <span>{PIZZA_INFO[img].icon}</span>
                <span className="hidden md:inline text-[10px]">{PIZZA_INFO[img].label}</span>
              </button>
            ))}
          </div>

          {/* Botón PWA de instalación en Android / Chrome */}
          {deferredPrompt && (
            <button
              onClick={handleInstallApp}
              className="px-2 py-1 bg-emerald-400 hover:bg-emerald-300 border-2 border-slate-900 rounded-xl font-black text-xs shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center gap-1 animate-pulse"
              title="Instalar App en tu pantalla de inicio"
            >
              <span>📲</span>
              <span className="hidden sm:inline text-[10px] font-black uppercase">Instalar App</span>
            </button>
          )}

          {/* Trofeos */}
          <button
            onClick={() => {
              setIsTrophyOpen(true);
              audio.playPop(520);
            }}
            className="px-2 py-1 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 rounded-xl font-black text-xs shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5 text-slate-900" />
            <span className="bg-slate-900 text-amber-300 px-1 py-0.2 rounded text-[10px] font-black">
              ⭐ {stats.stars}
            </span>
          </button>

          {/* Música */}
          <button
            onClick={toggleMusicOnly}
            className={`p-1.5 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center justify-center ${
              isMusicPlaying ? 'bg-emerald-300 text-emerald-950' : 'bg-slate-100 text-slate-500'
            }`}
            title={isMusicPlaying ? 'Pausar Música' : 'Música Italiana'}
          >
            <Music className="w-3.5 h-3.5" />
          </button>

          {/* Sonido */}
          <button
            onClick={toggleSound}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center justify-center"
            title={isAudioMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </button>
        </div>
      </header>

      {/* ==========================================
          BANNER DE ALTAIR (AVATAR GRANDE PROTAGÓNICO 95-140px)
      ========================================== */}
      <div className="bg-amber-200/85 border-b-2 sm:border-b-3 border-slate-900 px-2 sm:px-4 py-1.5 flex items-center justify-between shrink-0 shadow-[0_2px_0_#0f172a] gap-2">
        <AltairAvatar
          emotion={altairEmotion}
          speech={altairSpeech}
          badge={
            activeTab === 1 && cutCompleted ? (
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-sm ml-1">
                {currentSharing.fraction} cada uno
              </span>
            ) : null
          }
        />
      </div>

      {/* ==========================================
          ÁREA CENTRAL RESPONSIVE "ZERO-SCROLL"
      ========================================== */}
      <main className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-1 sm:p-2 overflow-hidden">
        {/* ----------------------------------------
            MODO 1: CORTAR (REPARTIR PARA INVITADOS)
        ---------------------------------------- */}
        {activeTab === 1 && (
          <div className="h-full w-full flex flex-col items-center justify-between py-0.5 gap-1">
            <div className="flex items-center gap-1 sm:gap-2 bg-white border-2 border-slate-900 rounded-2xl p-1 shadow-[2px_2px_0_#0f172a] shrink-0">
              <span className="text-[10px] sm:text-xs font-black text-slate-700 px-1 hidden sm:inline">
                👥 Repartir en:
              </span>
              {SHARING_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.guests}
                  onClick={() => startCutChallenge(idx)}
                  className={`px-2 py-0.5 rounded-xl text-xs sm:text-sm font-black border-2 border-slate-900 transition-all active:scale-95 ${
                    cutChallengeIdx === idx
                      ? 'bg-amber-400 text-slate-900 shadow-[1px_1px_0_#0f172a]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.guests} ({opt.fraction})
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-1">
              <SlicingPizzaBoard
                totalSlices={currentSharing.guests}
                pizzaImage={selectedPizza}
                onAllCutsCompleted={handleAllCutsDone}
                isCompleted={cutCompleted}
                size={Math.min(window.innerHeight * 0.44, window.innerWidth * 0.85, 300)}
                currentLineIdx={cutCurrentLine}
                setCurrentLineIdx={setCutCurrentLine}
                completedLines={cutLinesDone}
                setCompletedLines={setCutLinesDone}
              />
            </div>

            <div className="shrink-0 flex items-center justify-center gap-2">
              {cutCompleted ? (
                <button
                  onClick={nextRandomCutChallenge}
                  className="py-1 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm rounded-xl border-2 sm:border-3 border-slate-900 shadow-[3px_3px_0_#0f172a] active:translate-y-0.5 animate-bounce flex items-center gap-1.5"
                >
                  <span>🎉 ¡Siguiente Pedido!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="bg-white/95 border-2 border-slate-900 rounded-xl px-3 py-0.5 shadow-[1px_1px_0_#0f172a] text-[10px] sm:text-xs font-bold text-center text-slate-700">
                  ✂️ <strong>Toca el punto rojo</strong> y arrastra a lo largo de la línea luminosa para cortar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------
            MODO 2: SUMAS CON HUELLA VACÍA Y CAJA
        ---------------------------------------- */}
        {activeTab === 2 && (
          <div className="h-full w-full flex flex-col items-center justify-between py-0.5 gap-1">
            <div className="flex items-center justify-between w-full max-w-lg px-2 shrink-0">
              <div
                className={`px-2.5 py-0.5 rounded-xl border-2 border-slate-900 text-xs sm:text-sm font-black shadow-[2px_2px_0_#0f172a] transition-all ${
                  isSumComplete ? 'bg-emerald-400 text-slate-950 animate-bounce' : 'bg-rose-500 text-white'
                }`}
              >
                {p1Total}/{sumDen} + {p2Total}/{sumDen} = {inBoxCount}/{sumDen} {isSumComplete ? '✅' : '⏳'}
              </div>
              <button
                onClick={newRandomSum}
                className="py-1 px-3 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 rounded-xl text-xs font-black shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nueva Suma</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row items-center justify-around gap-1 sm:gap-4 px-1 max-w-3xl">
              <div className="flex sm:contents flex-row items-center justify-around w-full gap-2 shrink-0">
                <div className="flex flex-col items-center p-1 sm:p-2 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-slate-900 shadow-[2px_2px_0_#0f172a] shrink-0 sm:order-1">
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 mb-0.5">
                    Plato 1 ({p1Total - p1Transferred.filter(Boolean).length}/{sumDen})
                  </span>
                  <PizzaPlateComponent
                    totalSlices={sumDen}
                    sliceStates={Array.from({ length: sumDen }).map((_, i) => {
                      if (i >= p1Total) return 'unused';
                      return p1Transferred[i] ? 'empty_shadow' : 'present';
                    })}
                    pizzaImage={selectedPizza}
                    onSliceClick={toggleSliceP1}
                    size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 135)}
                  />
                  <span className="text-[9px] text-slate-500 font-bold block sm:hidden mt-0.5">⬇️ Pasa a caja</span>
                </div>

                <span className="hidden sm:inline text-2xl font-black text-slate-800 shrink-0 sm:order-2">➡️</span>

                <div className="flex flex-col items-center p-1 sm:p-2 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-slate-900 shadow-[2px_2px_0_#0f172a] shrink-0 sm:order-5">
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 mb-0.5">
                    Plato 2 ({p2Total - p2Transferred.filter(Boolean).length}/{sumDen})
                  </span>
                  <PizzaPlateComponent
                    totalSlices={sumDen}
                    sliceStates={Array.from({ length: sumDen }).map((_, i) => {
                      if (i >= p2Total) return 'unused';
                      return p2Transferred[i] ? 'empty_shadow' : 'present';
                    })}
                    pizzaImage={selectedPizza}
                    onSliceClick={toggleSliceP2}
                    size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 135)}
                  />
                  <span className="text-[9px] text-slate-500 font-bold block sm:hidden mt-0.5">⬇️ Pasa a caja</span>
                </div>
              </div>

              <span className="hidden sm:inline text-2xl font-black text-slate-800 shrink-0 sm:order-4">⬅️</span>

              <div className="shrink-0 sm:order-3">
                <InteractiveDeliveryBox
                  totalSlices={sumDen}
                  sliceStates={Array.from({ length: sumDen }).map((_, i) =>
                    i < inBoxCount ? 'present' : 'unused'
                  )}
                  pizzaImage={selectedPizza}
                  label={`CAJA (${inBoxCount}/${sumDen})`}
                  size={Math.min(window.innerWidth * 0.36, window.innerHeight * 0.26, 155)}
                  deliveryState={sumDeliveryState}
                  onSliceClick={() => {
                    if (sumDeliveryState !== 'idle') return;
                    const p2Active = p2Transferred.lastIndexOf(true);
                    if (p2Active !== -1) {
                      toggleSliceP2(p2Active);
                      return;
                    }
                    const p1Active = p1Transferred.lastIndexOf(true);
                    if (p1Active !== -1) {
                      toggleSliceP1(p1Active);
                    }
                  }}
                  canDeliverManually={isSumComplete}
                  onDeliverClick={handleSumComplete}
                  onNewOperation={newRandomSum}
                />
              </div>
            </div>

            <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-center text-slate-700 bg-white border-2 border-slate-900 rounded-xl px-2 py-0.5 shadow-[1px_1px_0_#0f172a]">
              💡 <strong>Toca una rebanada</strong> para pasarla a la caja. Toca la huella vacía ↩️ para regresarla.
            </div>
          </div>
        )}

        {/* ----------------------------------------
            MODO 3: RESTAS (COMER REBANADAS CON ALTAIR)
        ---------------------------------------- */}
        {activeTab === 3 && (
          <div className="h-full w-full flex flex-col items-center justify-between py-1 gap-1">
            <div className="flex items-center justify-between w-full max-w-sm px-2 shrink-0">
              <div className="px-2 py-0.5 bg-purple-200 border-2 border-slate-900 rounded-xl text-xs font-black">
                {resStart}/{resDen} - {resEatenIndices.length}/{resDen} = {resStart - resEatenIndices.length}/{resDen}
              </div>
              <button
                onClick={newRandomResta}
                className="py-1 px-3 bg-purple-400 hover:bg-purple-300 border-2 border-slate-900 rounded-xl text-xs font-black shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nueva Resta</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-1">
              <div className="bg-white border-3 sm:border-4 border-slate-900 rounded-3xl p-2 shadow-[4px_4px_0_#0f172a]">
                <PizzaPlateComponent
                  totalSlices={resDen}
                  sliceStates={Array.from({ length: resDen }).map((_, i) => {
                    if (i >= resStart) return 'unused';
                    return resEatenIndices.includes(i) ? 'empty_shadow' : 'present';
                  })}
                  pizzaImage={selectedPizza}
                  onSliceClick={handleSliceClickResta}
                  size={Math.min(window.innerHeight * 0.42, 280)}
                />
              </div>
            </div>

            <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-center text-slate-700 bg-white border-2 border-slate-900 rounded-xl px-2 py-0.5 shadow-[1px_1px_0_#0f172a]">
              😋 <strong>Toca cualquier rebanada</strong> para que Altair la muerda. Toca la huella para deshacer el mordisco.
            </div>
          </div>
        )}

        {/* ----------------------------------------
            MODO 4: AVANZADAS (CORTE DE 1/2 A CUARTOS)
        ---------------------------------------- */}
        {activeTab === 4 && (
          <div className="h-full w-full flex flex-col items-center justify-between py-0.5 gap-1">
            <div className="flex items-center justify-between w-full max-w-lg px-2 shrink-0">
              <span className="text-xs font-black bg-white px-2 py-0.5 rounded-lg border-2 border-slate-900">
                {advCutDone ? '✅ 2/4 + 1/4 = 3/4' : '✂️ Corta 1/2 con tu dedo'}
              </span>
              <button
                onClick={resetAdvState}
                className="py-1 px-3 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 rounded-xl text-xs font-black shadow-[2px_2px_0_#0f172a] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row items-center justify-around gap-1 sm:gap-4 px-1 max-w-3xl">
              <div className="flex sm:contents flex-row items-center justify-around w-full gap-2 shrink-0">
                <div
                  className="flex flex-col items-center p-1 sm:p-2 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-slate-900 shadow-[2px_2px_0_#0f172a] shrink-0 sm:order-1 cursor-pointer"
                  onClick={!advCutDone ? handleAdvCut : undefined}
                >
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 mb-0.5">
                    {advCutDone ? 'Plato 1: 2/4' : '1/2 (Corta ✂️)'}
                  </span>
                  <PizzaPlateComponent
                    totalSlices={advCutDone ? 4 : 2}
                    sliceStates={
                      advCutDone
                        ? [
                            advP1Transferred[0] ? 'empty_shadow' : 'present',
                            advP1Transferred[1] ? 'empty_shadow' : 'present',
                            'unused',
                            'unused',
                          ]
                        : ['present', 'unused']
                    }
                    pizzaImage={selectedPizza}
                    onSliceClick={advCutDone ? toggleAdvP1 : handleAdvCut}
                    size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 135)}
                  />
                  <span className="text-[9px] text-slate-500 font-bold block sm:hidden mt-0.5">
                    {advCutDone ? '⬇️ Toca para pasar' : '✂️ Toca para cortar'}
                  </span>
                </div>

                <span className="hidden sm:inline text-2xl font-black text-slate-800 shrink-0 sm:order-2">➡️</span>

                <div className="flex flex-col items-center p-1 sm:p-2 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-slate-900 shadow-[2px_2px_0_#0f172a] shrink-0 sm:order-5">
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 mb-0.5">Plato 2: 1/4</span>
                  <PizzaPlateComponent
                    totalSlices={4}
                    sliceStates={[advP2Transferred[0] ? 'empty_shadow' : 'present', 'unused', 'unused', 'unused']}
                    pizzaImage={selectedPizza}
                    onSliceClick={advCutDone ? toggleAdvP2 : undefined}
                    size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 135)}
                  />
                  <span className="text-[9px] text-slate-500 font-bold block sm:hidden mt-0.5">⬇️ Toca para pasar</span>
                </div>
              </div>

              <span className="hidden sm:inline text-2xl font-black text-slate-800 shrink-0 sm:order-4">⬅️</span>

              <div className="shrink-0 sm:order-3">
                <InteractiveDeliveryBox
                  totalSlices={4}
                  sliceStates={Array.from({ length: 4 }).map((_, i) =>
                    i < advP1Transferred.filter(Boolean).length + advP2Transferred.filter(Boolean).length
                      ? 'present'
                      : 'unused'
                  )}
                  pizzaImage={selectedPizza}
                  label={`CAJA (${advP1Transferred.filter(Boolean).length + advP2Transferred.filter(Boolean).length}/4)`}
                  size={Math.min(window.innerWidth * 0.36, window.innerHeight * 0.26, 155)}
                  deliveryState={advDeliveryState}
                  onNewOperation={resetAdvState}
                />
              </div>
            </div>

            <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-center text-slate-700 bg-white border-2 border-slate-900 rounded-xl px-2 py-0.5 shadow-[1px_1px_0_#0f172a]">
              ✂️ <strong>Equivalencia:</strong> 1/2 es igual a 2/4. ¡Al emparejarlas encajan en la caja!
            </div>
          </div>
        )}

        {/* ----------------------------------------
            MODO 5: MISIONES (LOTES DE 5)
        ---------------------------------------- */}
        {activeTab === 5 && (
          <div className="h-full w-full flex flex-col items-center justify-between py-0.5 gap-1">
            <div className="flex items-center justify-between w-full max-w-md bg-white border-2 border-slate-900 rounded-2xl p-1 px-2.5 shadow-[2px_2px_0_#0f172a] shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black">Lote #{batchIndex}:</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-5 h-5 rounded-lg border-2 border-slate-900 flex items-center justify-center text-[10px] font-black ${
                        step < currentStepIndex || batchCompleted
                          ? 'bg-emerald-400 text-slate-900'
                          : step === currentStepIndex
                          ? 'bg-amber-400 text-slate-900 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-base">{currentMission.clientIcon}</span>
                <span className="text-xs font-black truncate max-w-[100px]">{currentMission.clientName}</span>
              </div>
            </div>

            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-1">
              {batchCompleted ? (
                <div className="bg-white border-3 sm:border-4 border-slate-900 rounded-3xl p-4 text-center max-w-sm shadow-[4px_4px_0_#0f172a]">
                  <span className="text-4xl animate-bounce inline-block">👑</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 uppercase">
                    ¡TURNO COMPLETADO CON ÉXITO!
                  </h3>
                  <p className="text-xs font-bold text-amber-800 mt-0.5">
                    Entregaste las 5 comandas a los clientes. ¡Ganaste +5 estrellas de oro!
                  </p>
                  <button
                    onClick={generateNewBatch}
                    className="mt-3 py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_#0f172a] active:translate-y-0.5"
                  >
                    🚀 ¡Siguiente Turno (Lote #{batchIndex + 1})!
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {(currentMission.type === 'sum' || currentMission.type === 'combo') && (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-1 sm:gap-4 max-w-3xl">
                      <div className="flex sm:contents flex-row items-center justify-around w-full gap-2 shrink-0">
                        <div className="flex flex-col items-center p-1 bg-white rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#0f172a] sm:order-1">
                          <span className="text-[10px] font-black">{currentMission.p1Count} reb.</span>
                          <PizzaPlateComponent
                            totalSlices={currentMission.den}
                            sliceStates={Array.from({ length: currentMission.den }).map((_, i) => {
                              if (i >= (currentMission.p1Count || 2)) return 'unused';
                              return mP1Trans[i] ? 'empty_shadow' : 'present';
                            })}
                            pizzaImage={selectedPizza}
                            onSliceClick={(i) => {
                              if (i >= (currentMission.p1Count || 2) || missionDeliveryState !== 'idle') return;
                              const next = [...mP1Trans];
                              next[i] = !next[i];
                              setMP1Trans(next);
                              audio.playPop(next[i] ? 450 : 350);
                              const total = next.filter(Boolean).length + mP2Trans.filter(Boolean).length;
                              if (total === (currentMission.p1Count || 2) + (currentMission.p2Count || 1)) {
                                triggerMissionDelivery('¡Excelente trabajo! Has completado el pedido a la perfección.');
                              }
                            }}
                            size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 130)}
                          />
                        </div>

                        <div className="flex flex-col items-center p-1 bg-white rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#0f172a] sm:order-3">
                          <span className="text-[10px] font-black">{currentMission.p2Count} reb.</span>
                          <PizzaPlateComponent
                            totalSlices={currentMission.den}
                            sliceStates={Array.from({ length: currentMission.den }).map((_, i) => {
                              if (i >= (currentMission.p2Count || 1)) return 'unused';
                              return mP2Trans[i] ? 'empty_shadow' : 'present';
                            })}
                            pizzaImage="queso.png"
                            onSliceClick={(i) => {
                              if (i >= (currentMission.p2Count || 1) || missionDeliveryState !== 'idle') return;
                              const next = [...mP2Trans];
                              next[i] = !next[i];
                              setMP2Trans(next);
                              audio.playPop(next[i] ? 470 : 360);
                              const total = mP1Trans.filter(Boolean).length + next.filter(Boolean).length;
                              if (total === (currentMission.p1Count || 2) + (currentMission.p2Count || 1)) {
                                triggerMissionDelivery('¡Excelente trabajo! Has completado el pedido a la perfección.');
                              }
                            }}
                            size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 130)}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 sm:order-2">
                        <InteractiveDeliveryBox
                          totalSlices={currentMission.den}
                          sliceStates={Array.from({ length: currentMission.den }).map((_, i) =>
                            i < mP1Trans.filter(Boolean).length + mP2Trans.filter(Boolean).length ? 'present' : 'unused'
                          )}
                          pizzaImage={selectedPizza}
                          label={`CAJA (${mP1Trans.filter(Boolean).length + mP2Trans.filter(Boolean).length}/${currentMission.den})`}
                          size={Math.min(window.innerWidth * 0.36, window.innerHeight * 0.26, 150)}
                          deliveryState={missionDeliveryState}
                        />
                      </div>
                    </div>
                  )}

                  {currentMission.type === 'resta' && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="bg-white border-3 border-slate-900 rounded-3xl p-2 shadow-[4px_4px_0_#0f172a]">
                        <PizzaPlateComponent
                          totalSlices={currentMission.den}
                          sliceStates={Array.from({ length: currentMission.den }).map((_, i) => {
                            if (i >= (currentMission.p1Count || 4)) return 'unused';
                            return mEatenIndices.includes(i) ? 'empty_shadow' : 'present';
                          })}
                          pizzaImage={selectedPizza}
                          onSliceClick={(i) => {
                            if (i >= (currentMission.p1Count || 4)) return;
                            let next: number[];
                            if (mEatenIndices.includes(i)) {
                              next = mEatenIndices.filter((idx) => idx !== i);
                              audio.playPop(340);
                            } else {
                              if (mEatenIndices.length >= currentMission.targetCount) return;
                              next = [...mEatenIndices, i];
                              audio.playChew();
                            }
                            setMEatenIndices(next);
                            if (next.length === currentMission.targetCount) {
                              advanceMissionStep('¡Excelente trabajo! Has completado el pedido a la perfección.');
                            }
                          }}
                          size={Math.min(window.innerHeight * 0.40, 260)}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-900">
                        Comidas: {mEatenIndices.length} de {currentMission.targetCount} rebanadas
                      </span>
                    </div>
                  )}

                  {currentMission.type === 'equiv' && (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-1 sm:gap-4 max-w-3xl">
                      <div className="flex sm:contents flex-row items-center justify-around w-full gap-2 shrink-0">
                        <div
                          className="flex flex-col items-center p-1 bg-white rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#0f172a] sm:order-1 cursor-pointer"
                          onClick={!mCutDone ? () => setMCutDone(true) : undefined}
                        >
                          <span className="text-[10px] font-black">{mCutDone ? '2/4' : '1/2 (Corta ✂️)'}</span>
                          <PizzaPlateComponent
                            totalSlices={mCutDone ? 4 : 2}
                            sliceStates={
                              mCutDone
                                ? [mP1Trans[0] ? 'empty_shadow' : 'present', mP1Trans[1] ? 'empty_shadow' : 'present', 'unused', 'unused']
                                : ['present', 'unused']
                            }
                            pizzaImage={selectedPizza}
                            onSliceClick={
                              mCutDone
                                ? (i) => {
                                    if (i >= 2 || missionDeliveryState !== 'idle') return;
                                    const next = [...mP1Trans];
                                    next[i] = !next[i];
                                    setMP1Trans(next);
                                    audio.playPop(next[i] ? 450 : 350);
                                    const total = next.filter(Boolean).length + mP2Trans.filter(Boolean).length;
                                    if (total === 3) {
                                      triggerMissionDelivery('¡Excelente trabajo! Has completado el pedido a la perfección.');
                                    }
                                  }
                                : () => {
                                    setMCutDone(true);
                                    audio.playSliceCut();
                                    setAltairSpeech('¡Genial! Ahora tienen el mismo tamaño. Pásalas a la caja para sumarlas.');
                                  }
                            }
                            size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 130)}
                          />
                        </div>

                        <div className="flex flex-col items-center p-1 bg-white rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#0f172a] sm:order-3">
                          <span className="text-[10px] font-black">1/4</span>
                          <PizzaPlateComponent
                            totalSlices={4}
                            sliceStates={[mP2Trans[0] ? 'empty_shadow' : 'present', 'unused', 'unused', 'unused']}
                            pizzaImage={selectedPizza}
                            onSliceClick={
                              mCutDone
                                ? (i) => {
                                    if (i >= 1 || missionDeliveryState !== 'idle') return;
                                    const next = [...mP2Trans];
                                    next[i] = !next[i];
                                    setMP2Trans(next);
                                    audio.playPop(next[i] ? 470 : 360);
                                    const total = mP1Trans.filter(Boolean).length + next.filter(Boolean).length;
                                    if (total === 3) {
                                      triggerMissionDelivery('¡Excelente trabajo! Has completado el pedido a la perfección.');
                                    }
                                  }
                                : undefined
                            }
                            size={Math.min(window.innerWidth * 0.32, window.innerHeight * 0.24, 130)}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 sm:order-2">
                        <InteractiveDeliveryBox
                          totalSlices={4}
                          sliceStates={Array.from({ length: 4 }).map((_, i) =>
                            i < mP1Trans.filter(Boolean).length + mP2Trans.filter(Boolean).length ? 'present' : 'unused'
                          )}
                          pizzaImage={selectedPizza}
                          label={`CAJA (${mP1Trans.filter(Boolean).length + mP2Trans.filter(Boolean).length}/4)`}
                          size={Math.min(window.innerWidth * 0.36, window.innerHeight * 0.26, 150)}
                          deliveryState={missionDeliveryState}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          BARRA INFERIOR DE 5 PESTAÑAS
      ========================================== */}
      <footer className="bg-white border-t-3 sm:border-t-4 border-slate-900 px-1 sm:px-2 py-1 flex items-center justify-around shrink-0 z-40 max-w-2xl mx-auto w-full rounded-t-2xl sm:rounded-t-3xl shadow-[0_-3px_0_#0f172a]">
        {[
          { id: 1, label: 'Cortar', icon: '🍕' },
          { id: 2, label: 'Sumas', icon: '➕' },
          { id: 3, label: 'Restas', icon: '➖' },
          { id: 4, label: 'Avanzadas', icon: '⚡' },
          { id: 5, label: 'Misiones', icon: '🎯' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as 1 | 2 | 3 | 4 | 5)}
            className={`flex flex-col items-center py-0.5 sm:py-1 px-2.5 sm:px-3.5 rounded-xl border-2 border-slate-900 font-black text-xs sm:text-sm transition-transform active:scale-95 ${
              activeTab === tab.id
                ? 'bg-amber-400 text-slate-900 shadow-[2px_2px_0_#0f172a] -translate-y-0.5'
                : 'bg-amber-50 text-slate-600 hover:bg-amber-100'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">{tab.icon}</span>
            <span className="mt-0.5 leading-none text-[11px] sm:text-xs">{tab.label}</span>
          </button>
        ))}
      </footer>
    </div>
  );
}

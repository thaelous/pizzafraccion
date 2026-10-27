/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

// ============================================================
// AYUDAS TRIGONOMÉTRICAS PARA SVG NATIVO
// ============================================================
function getArcPoint(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function createSlicePath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = getArcPoint(cx, cy, radius, endAngle);
  const end = getArcPoint(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

// ============================================================
// CHEF MONSTRUITO (Plants vs. Zombies / Dumb Ways to Die)
// ============================================================
type ChefMood = 'happy' | 'thinking' | 'eating' | 'celebrating';

const ChefMonster: React.FC<{ mood: ChefMood; className?: string }> = ({ mood, className = 'w-16 h-16' }) => {
  return (
    <div className={`${className} bg-purple-500 rounded-2xl border-4 border-slate-900 comic-shadow-sm flex items-center justify-center overflow-hidden animate-wobble flex-shrink-0 relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Cuerpo Frijolito Morado */}
        <ellipse cx="50" cy="56" rx="35" ry="40" fill="#a855f7" stroke="#0f172a" strokeWidth="5" />

        {/* Gorro de Chef Blanco */}
        <g className={mood === 'celebrating' ? 'animate-bounce' : ''}>
          <path d="M 28 34 C 18 18, 45 4, 50 18 C 55 4, 82 18, 72 34 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="5" />
          <rect x="28" y="30" width="44" height="9" rx="4" fill="#f1f5f9" stroke="#0f172a" strokeWidth="4" />
        </g>

        {/* Mejillas Rosadas */}
        <circle cx="28" cy="62" r="5" fill="#f472b6" opacity="0.6" />
        <circle cx="72" cy="62" r="5" fill="#f472b6" opacity="0.6" />

        {/* OJOS */}
        {mood === 'happy' && (
          <g>
            <circle cx="39" cy="48" r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="4.5" />
            <circle cx="63" cy="47" r="10" fill="#ffffff" stroke="#0f172a" strokeWidth="4.5" />
            <circle cx="41" cy="48" r="4.5" fill="#0f172a" />
            <circle cx="65" cy="47" r="4" fill="#0f172a" />
            <circle cx="39" cy="46" r="1.5" fill="#ffffff" />
            <circle cx="63" cy="45" r="1.5" fill="#ffffff" />
          </g>
        )}

        {mood === 'thinking' && (
          <g>
            <circle cx="39" cy="48" r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="4.5" />
            <circle cx="63" cy="47" r="10" fill="#ffffff" stroke="#0f172a" strokeWidth="4.5" />
            <circle cx="43" cy="43" r="4.5" fill="#0f172a" />
            <circle cx="67" cy="42" r="4" fill="#0f172a" />
            <path d="M 32 35 Q 40 31 48 36" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <path d="M 58 37 Q 65 35 72 38" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {mood === 'eating' && (
          <g>
            {/* Ojos cerrados de satisfacción deliciosa al comer */}
            <path d="M 32 48 Q 40 42 48 48" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 54 48 Q 62 42 70 48" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}

        {mood === 'celebrating' && (
          <g>
            {/* Ojos brillantes felices estilo cómic */}
            <path d="M 30 48 Q 40 38 50 48" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
            <path d="M 54 48 Q 64 38 74 48" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
            <polygon points="50,2 52,8 58,10 52,12 50,18 48,12 42,10 48,8" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        )}

        {/* BOCA */}
        {mood === 'happy' && (
          <g>
            <path d="M 38 68 Q 50 78 64 68" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
            <rect x="47" y="67" width="6" height="6" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" rx="1.5" />
          </g>
        )}

        {mood === 'thinking' && (
          <g>
            <ellipse cx="52" cy="71" rx="5" ry="4" fill="#0f172a" />
          </g>
        )}

        {mood === 'eating' && (
          <g className="animate-bounce">
            {/* Boca masticando una rebanadita de pizza */}
            <ellipse cx="50" cy="70" rx="9" ry="7" fill="#0f172a" />
            <polygon points="46,71 58,66 54,76" fill="#facc15" stroke="#ea580c" strokeWidth="1" />
            <circle cx="51" cy="70" r="1.5" fill="#ef4444" />
          </g>
        )}

        {mood === 'celebrating' && (
          <g>
            <path d="M 36 65 Q 50 82 66 65 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
            <path d="M 43 72 Q 50 79 57 72 Z" fill="#f43f5e" />
            <rect x="44" y="64" width="6" height="5" fill="#ffffff" rx="1" />
            <rect x="52" y="64" width="6" height="5" fill="#ffffff" rx="1" />
          </g>
        )}
      </svg>
    </div>
  );
};

// ============================================================
// PIZZA SVG INTERACTIVA CON CARITAS Y LÍNEAS ASISTIDAS
// ============================================================
interface PizzaSvgProps {
  totalSlices: number;
  activeSlices: number;
  sliceColor?: string;
  crustColor?: string;
  emptyColor?: string;
  className?: string;
  showAssistedDashes?: boolean;
  onSliceClick?: (index: number) => void;
  interactive?: boolean;
}

const PizzaSVG: React.FC<PizzaSvgProps> = ({
  totalSlices,
  activeSlices,
  sliceColor = '#facc15',
  crustColor = '#f59e0b',
  emptyColor = '#fef3c7',
  className = '',
  showAssistedDashes = false,
  onSliceClick,
  interactive = false,
}) => {
  const cx = 100;
  const cy = 100;
  const radius = 86;
  const anglePerSlice = 360 / totalSlices;

  const slices = [];
  const assistGuides = [];

  for (let i = 0; i < totalSlices; i++) {
    const startAngle = i * anglePerSlice;
    const endAngle = startAngle + anglePerSlice;
    const isActive = i < activeSlices;
    const pathD = createSlicePath(cx, cy, radius, startAngle, endAngle);

    // Pepperoni con carita amigable
    let pepperoniFace = null;
    if (isActive) {
      const midAngle = startAngle + anglePerSlice / 2;
      const pepDist = radius * 0.58;
      const pepPos = getArcPoint(cx, cy, pepDist, midAngle);
      const pepRadius = totalSlices >= 8 ? 6 : totalSlices >= 6 ? 7.5 : 9.5;

      pepperoniFace = (
        <g key={`pep-${i}`} className="pointer-events-none">
          <circle
            cx={pepPos.x}
            cy={pepPos.y}
            r={pepRadius}
            fill="#ef4444"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          {totalSlices <= 8 && (
            <g>
              <circle
                cx={pepPos.x - (totalSlices >= 8 ? 2 : 2.8)}
                cy={pepPos.y - 1}
                r={totalSlices >= 8 ? 1.2 : 1.6}
                fill="#0f172a"
              />
              <circle
                cx={pepPos.x + (totalSlices >= 8 ? 2 : 2.8)}
                cy={pepPos.y - 1}
                r={totalSlices >= 8 ? 1.2 : 1.6}
                fill="#0f172a"
              />
              {totalSlices <= 4 && (
                <path
                  d={`M ${pepPos.x - 2.5} ${pepPos.y + 2.5} Q ${pepPos.x} ${pepPos.y + 4.5} ${pepPos.x + 2.5} ${pepPos.y + 2.5}`}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              )}
            </g>
          )}
        </g>
      );
    }

    // Líneas punteadas de corte asistido
    if (showAssistedDashes && isActive) {
      const midAngle = startAngle + anglePerSlice / 2;
      const edgePoint = getArcPoint(cx, cy, radius + 2, midAngle);
      assistGuides.push(
        <line
          key={`dash-${i}`}
          x1={cx}
          y1={cy}
          x2={edgePoint.x}
          y2={edgePoint.y}
          stroke="#ea580c"
          strokeWidth="3.5"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
      );
    }

    slices.push(
      <g
        key={`slice-${i}`}
        onClick={() => {
          if (onSliceClick && isActive) {
            onSliceClick(i);
          }
        }}
        className={interactive && isActive ? 'cursor-pointer hover:opacity-90' : ''}
      >
        <path
          d={pathD}
          fill={isActive ? sliceColor : emptyColor}
          stroke="#0f172a"
          strokeWidth="4"
          className="slice-path"
        />
        {pepperoniFace}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 200 200" className={className}>
      {/* Plato / Borde exterior de masa dorada */}
      <circle cx={cx} cy={cy} r={radius + 6} fill={crustColor} stroke="#0f172a" strokeWidth="5" />
      {/* Salsa de tomate */}
      <circle cx={cx} cy={cy} r={radius + 1} fill="#dc2626" stroke="#0f172a" strokeWidth="2" />
      {/* Rebanadas */}
      {slices}
      {/* Guías asistidas */}
      {assistGuides}
    </svg>
  );
};

// ============================================================
// LLUVIA DE ESTRELLAS Y CONFETI (SVG NATIVO)
// ============================================================
const CelebrationStars: React.FC = () => {
  const items = [
    { x: '10%', delay: '0s', color: '#facc15', star: true },
    { x: '25%', delay: '0.15s', color: '#38bdf8', star: false },
    { x: '40%', delay: '0.05s', color: '#f43f5e', star: true },
    { x: '55%', delay: '0.2s', color: '#4ade80', star: false },
    { x: '70%', delay: '0.1s', color: '#c084fc', star: true },
    { x: '85%', delay: '0.25s', color: '#fb923c', star: false },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="absolute animate-confetti"
          style={{ left: item.x, top: '-20px', animationDelay: item.delay }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24">
            {item.star ? (
              <polygon
                points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8"
                fill={item.color}
                stroke="#0f172a"
                strokeWidth="2"
              />
            ) : (
              <circle cx="12" cy="12" r="8" fill={item.color} stroke="#0f172a" strokeWidth="2.5" />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  const [currentMode, setCurrentMode] = useState<1 | 2 | 3 | 4>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [chefMood, setChefMood] = useState<ChefMood>('happy');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Sonidos suaves sintetizados nativamente
  const playPop = (freq = 440) => {
    if (isMuted) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const playSliceCrunch = () => {
    if (isMuted) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const playNomNom = () => {
    if (isMuted) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      // Secuencia dulce de dos mordisquitos ("ñam-ñam")
      const notes = [330, 440];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + idx * 0.12 + 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.1);
      });
    } catch {}
  };

  const playThinking = () => {
    if (isMuted) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  const playSuccessChord = () => {
    if (isMuted) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Do, Mi, Sol, Do
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {}
  };

  // ============================================================
  // ESTADO MODO 1: CORTADOR MÁGICO CON CORTE ASISTIDO
  // ============================================================
  const [m1BaseDen, setM1BaseDen] = useState<number>(2);
  const [m1ActiveSlices, setM1ActiveSlices] = useState<number>(1);
  const [m1ShowAssisted, setM1ShowAssisted] = useState(true);
  const [m1SliceAnimKey, setM1SliceAnimKey] = useState(0);

  const handleM1BaseSelect = (den: number) => {
    playPop(480);
    setM1BaseDen(den);
    setM1ActiveSlices(Math.max(1, Math.floor(den / 2)));
    setM1SliceAnimKey((k) => k + 1);
  };

  const handleM1SliceCutDouble = () => {
    if (m1BaseDen >= 8) {
      playPop(350);
      return;
    }
    playSliceCrunch();
    setChefMood('celebrating');
    // Duplicamos cortes (asistido): 1/2 -> 2/4; 1/3 -> 2/6; 1/4 -> 2/8
    setM1BaseDen((prev) => prev * 2);
    setM1ActiveSlices((prev) => prev * 2);
    setM1SliceAnimKey((k) => k + 1);
    setTimeout(() => setChefMood('happy'), 1500);
  };

  // ============================================================
  // ESTADO MODO 2: COCINA DE SUMAS BÁSICAS (MISMO DENOMINADOR)
  // ============================================================
  const [m2Den, setM2Den] = useState<number>(4);
  const [m2NumA, setM2NumA] = useState<number>(1);
  const [m2NumB, setM2NumB] = useState<number>(2);
  const [m2AddedA, setM2AddedA] = useState(false);
  const [m2AddedB, setM2AddedB] = useState(false);
  const [m2ShowCelebration, setM2ShowCelebration] = useState(false);

  const m2CurrentInBox = (m2AddedA ? m2NumA : 0) + (m2AddedB ? m2NumB : 0);
  const m2TargetSum = m2NumA + m2NumB;

  const handleM2Randomize = () => {
    playPop(520);
    const possibleDens = [4, 6, 8];
    const newDen = possibleDens[Math.floor(Math.random() * possibleDens.length)];
    const numA = Math.floor(Math.random() * (newDen - 2)) + 1;
    const maxB = newDen - numA;
    const numB = Math.floor(Math.random() * maxB) + 1;

    setM2Den(newDen);
    setM2NumA(numA);
    setM2NumB(numB);
    setM2AddedA(false);
    setM2AddedB(false);
    setM2ShowCelebration(false);
    setChefMood('happy');
  };

  const handleM2AddA = () => {
    if (m2AddedA) return;
    playPop(480);
    setM2AddedA(true);
    if (m2AddedB) {
      triggerM2Success();
    }
  };

  const handleM2AddB = () => {
    if (m2AddedB) return;
    playPop(520);
    setM2AddedB(true);
    if (m2AddedA) {
      triggerM2Success();
    }
  };

  const handleM2CombineAll = () => {
    if (m2AddedA && m2AddedB) return;
    playPop(520);
    setM2AddedA(true);
    setM2AddedB(true);
    triggerM2Success();
  };

  const triggerM2Success = () => {
    setChefMood('celebrating');
    setM2ShowCelebration(true);
    playSuccessChord();
    setTimeout(() => {
      setM2ShowCelebration(false);
    }, 4500);
  };

  // ============================================================
  // ESTADO MODO 3: LA FIESTA DE LAS RESTAS (COMER REBANADAS)
  // ============================================================
  const [m3Den, setM3Den] = useState<number>(6);
  const [m3InitialNum, setM3InitialNum] = useState<number>(5);
  const [m3EatenSlices, setM3EatenSlices] = useState<number[]>([]);
  const [m3TargetToEat, setM3TargetToEat] = useState<number>(2);

  const m3Remaining = m3InitialNum - m3EatenSlices.length;

  const handleM3SliceClick = (index: number) => {
    if (m3EatenSlices.includes(index)) return;
    if (m3EatenSlices.length >= m3TargetToEat) return;

    playNomNom();
    setChefMood('eating');
    setM3EatenSlices((prev) => [...prev, index]);

    setTimeout(() => {
      if (m3EatenSlices.length + 1 >= m3TargetToEat) {
        setChefMood('celebrating');
        playSuccessChord();
      } else {
        setChefMood('happy');
      }
    }, 600);
  };

  const handleM3Reset = () => {
    playPop(420);
    setM3EatenSlices([]);
    setChefMood('happy');
  };

  const handleM3NewChallenge = () => {
    playPop(500);
    const dens = [4, 6, 8];
    const newDen = dens[Math.floor(Math.random() * dens.length)];
    const init = Math.floor(Math.random() * (newDen - 2)) + 3; // 3 to newDen
    const eat = Math.floor(Math.random() * (init - 1)) + 1; // 1 to init - 1
    setM3Den(newDen);
    setM3InitialNum(init);
    setM3TargetToEat(eat);
    setM3EatenSlices([]);
    setChefMood('happy');
  };

  // ============================================================
  // ESTADO MODO 4: SUMAS AVANZADAS (DIFERENTE DENOMINADOR Y CORTE)
  // ============================================================
  const presetsM4 = [
    { name: '1/2 + 1/4', numA: 1, denA: 2, numB: 1, denB: 4 },
    { name: '1/2 + 3/8', numA: 1, denA: 2, numB: 3, denB: 8 },
    { name: '1/3 + 1/6', numA: 1, denA: 3, numB: 1, denB: 6 },
    { name: '2/4 + 1/8', numA: 2, denA: 4, numB: 1, denB: 8 },
  ];

  const [m4Index, setM4Index] = useState(0);
  const currentM4Preset = presetsM4[m4Index];

  const [m4IsSlicedA, setM4IsSlicedA] = useState(false);
  const [m4AddedA, setM4AddedA] = useState(false);
  const [m4AddedB, setM4AddedB] = useState(false);
  const [m4CutBouncing, setM4CutBouncing] = useState(false);
  const [m4Celebration, setM4Celebration] = useState(false);

  // La fracción A convertida: multiplica numerador y denominador por el factor (denB / denA)
  const factorA = currentM4Preset.denB / currentM4Preset.denA;
  const convertedNumA = currentM4Preset.numA * factorA;
  const commonDen = currentM4Preset.denB;

  const m4CurrentInBox = (m4AddedA ? convertedNumA : 0) + (m4AddedB ? currentM4Preset.numB : 0);
  const m4TargetSum = convertedNumA + currentM4Preset.numB;

  const handleM4CutAndMatch = () => {
    playSliceCrunch();
    setM4IsSlicedA(true);
    setChefMood('happy');
    playPop(520);
  };

  const handleM4EarlyAttempt = () => {
    playThinking();
    setChefMood('thinking');
    setM4CutBouncing(true);
    setTimeout(() => {
      setM4CutBouncing(false);
      setChefMood('happy');
    }, 1800);
  };

  const handleM4AddA = () => {
    if (!m4IsSlicedA) {
      handleM4EarlyAttempt();
      return;
    }
    if (m4AddedA) return;
    playPop(480);
    setM4AddedA(true);
    if (m4AddedB) {
      triggerM4Success();
    }
  };

  const handleM4AddB = () => {
    if (!m4IsSlicedA) {
      handleM4EarlyAttempt();
      return;
    }
    if (m4AddedB) return;
    playPop(520);
    setM4AddedB(true);
    if (m4AddedA) {
      triggerM4Success();
    }
  };

  const handleM4CombineAll = () => {
    if (!m4IsSlicedA) {
      handleM4EarlyAttempt();
      return;
    }
    if (m4AddedA && m4AddedB) return;
    setM4AddedA(true);
    setM4AddedB(true);
    triggerM4Success();
  };

  const triggerM4Success = () => {
    setChefMood('celebrating');
    setM4Celebration(true);
    playSuccessChord();
    setTimeout(() => setM4Celebration(false), 4500);
  };

  const handleM4SelectPreset = (idx: number) => {
    playPop(490);
    setM4Index(idx);
    setM4IsSlicedA(false);
    setM4AddedA(false);
    setM4AddedB(false);
    setM4Celebration(false);
    setChefMood('happy');
  };

  return (
    <div className="bg-[#84cc16] min-h-screen flex flex-col items-center justify-between p-3 sm:p-5 text-slate-900 overflow-x-hidden font-['Fredoka',cursive,sans-serif]">
      {/* ============================================================ */}
      {/* HEADER SUPERIOR CON AVATAR CHEF Y CONTROL DE AUDIO */}
      {/* ============================================================ */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-[#a3e635] p-3 sm:p-4 rounded-3xl border-4 border-slate-900 comic-shadow mb-4">
        <div className="flex items-center gap-3">
          <ChefMonster mood={chefMood} className="w-14 h-14 sm:w-16 sm:h-16" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase">
              La Pizzería Monstruosa
            </h1>
            <p className="text-xs sm:text-sm text-slate-800 font-bold">
              ¡Aprende Fracciones comiendo Pizza! 🍕
            </p>
          </div>
        </div>

        {/* Botón Mute accesible para prevención de sobrecarga sensorial */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              initAudio();
              setIsMuted(!isMuted);
            }}
            className={`p-3 min-h-[48px] rounded-2xl border-4 border-slate-900 comic-shadow-sm comic-shadow-active flex items-center justify-center font-bold cursor-pointer transition-colors ${
              isMuted ? 'bg-slate-300' : 'bg-amber-400 hover:bg-amber-300'
            }`}
            aria-label="Control de Sonido"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido (Confort auditivo)'}
          >
            <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* NAVEGADOR DE 4 MODOS (Pestañas grandes con alto contraste) */}
      {/* ============================================================ */}
      <nav className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <button
          onClick={() => {
            initAudio();
            playPop(460);
            setCurrentMode(1);
            setChefMood('happy');
          }}
          className={`py-3 px-2 min-h-[50px] rounded-2xl border-4 border-slate-900 font-black text-xs sm:text-sm text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            currentMode === 1
              ? 'bg-yellow-400 comic-shadow scale-102'
              : 'bg-slate-200 opacity-80 comic-shadow-sm hover:opacity-100'
          }`}
        >
          <span className="text-xl">🍕</span>
          <span>1. Cortador Mágico</span>
        </button>

        <button
          onClick={() => {
            initAudio();
            playPop(490);
            setCurrentMode(2);
            setChefMood('happy');
          }}
          className={`py-3 px-2 min-h-[50px] rounded-2xl border-4 border-slate-900 font-black text-xs sm:text-sm text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            currentMode === 2
              ? 'bg-yellow-400 comic-shadow scale-102'
              : 'bg-slate-200 opacity-80 comic-shadow-sm hover:opacity-100'
          }`}
        >
          <span className="text-xl">➕</span>
          <span>2. Sumas Básicas</span>
        </button>

        <button
          onClick={() => {
            initAudio();
            playPop(520);
            setCurrentMode(3);
            setChefMood('happy');
          }}
          className={`py-3 px-2 min-h-[50px] rounded-2xl border-4 border-slate-900 font-black text-xs sm:text-sm text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            currentMode === 3
              ? 'bg-yellow-400 comic-shadow scale-102'
              : 'bg-slate-200 opacity-80 comic-shadow-sm hover:opacity-100'
          }`}
        >
          <span className="text-xl">😋</span>
          <span>3. Fiesta de Restas</span>
        </button>

        <button
          onClick={() => {
            initAudio();
            playPop(550);
            setCurrentMode(4);
            setChefMood('happy');
          }}
          className={`py-3 px-2 min-h-[50px] rounded-2xl border-4 border-slate-900 font-black text-xs sm:text-sm text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            currentMode === 4
              ? 'bg-yellow-400 comic-shadow scale-102'
              : 'bg-slate-200 opacity-80 comic-shadow-sm hover:opacity-100'
          }`}
        >
          <span className="text-xl">🚀</span>
          <span>4. Sumas Avanzadas</span>
        </button>
      </nav>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      {/* ============================================================ */}
      <main className="w-full max-w-4xl flex-1 flex flex-col relative">

        {/* ------------------------------------------------------------ */}
        {/* MODO 1: EL CORTADOR MÁGICO CON CORTE ASISTIDO */}
        {/* ------------------------------------------------------------ */}
        {currentMode === 1 && (
          <section className="flex-1 bg-[#fef08a] rounded-3xl border-4 border-slate-900 comic-shadow p-4 sm:p-6 flex flex-col items-center justify-between">
            {/* Mensaje guiado */}
            <div className="flex items-center gap-3 w-full max-w-xl bg-white p-3.5 rounded-2xl border-4 border-slate-900 mb-3 shadow-sm">
              <span className="text-3xl flex-shrink-0 animate-bounce">👾</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                "¡Elige cortes base o pulsa el <strong className="text-amber-600">🔪 Cuchillo Asistido</strong> para rebanar cada trozo por la mitad! Verás que <strong className="text-blue-600 underline">la cantidad total de pizza nunca cambia</strong>."
              </p>
            </div>

            {/* Selectores de Fracción Base */}
            <div className="w-full max-w-md flex flex-wrap justify-center items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase text-slate-600 mr-1">Cortar en:</span>
              {[2, 3, 4, 6, 8].map((d) => (
                <button
                  key={d}
                  onClick={() => handleM1BaseSelect(d)}
                  className={`px-3 py-1.5 min-h-[44px] rounded-xl border-3 border-slate-900 font-black text-sm cursor-pointer transition-all ${
                    m1BaseDen === d
                      ? 'bg-amber-400 comic-shadow-sm scale-105'
                      : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  /{d}
                </button>
              ))}
            </div>

            {/* Zona Central: Pizza y Plato */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-1">
              <div className="absolute inset-0 rounded-full bg-cyan-300 border-4 border-slate-900 comic-shadow-sm flex items-center justify-center">
                <div className="w-11/12 h-11/12 rounded-full border-4 border-dashed border-cyan-600 opacity-30"></div>
              </div>

              <div key={m1SliceAnimKey} className="pop-in z-10">
                <PizzaSVG
                  totalSlices={m1BaseDen}
                  activeSlices={m1ActiveSlices}
                  sliceColor="#facc15"
                  crustColor="#ea580c"
                  emptyColor="#fef3c7"
                  showAssistedDashes={m1ShowAssisted}
                  className="w-56 h-56 sm:w-72 sm:h-72 relative filter drop-shadow-md"
                />
              </div>

              {/* Cortador de pizza animado */}
              <div
                onClick={handleM1SliceCutDouble}
                className="absolute -top-3 -right-3 w-14 h-14 bg-red-500 hover:bg-red-400 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl shadow-md z-20 cursor-pointer animate-bounce active:scale-95"
                title="¡Toca para cortar asistido!"
              >
                🔪
              </div>
            </div>

            {/* Conexión Triple de Conceptos: Numérica + Gráfica + Barra de Llenado */}
            <div className="flex flex-col items-center bg-white px-6 py-3 rounded-2xl border-4 border-slate-900 comic-shadow-sm mb-3 w-full max-w-lg">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Tu Porción Seleccionada
              </span>

              <div className="flex items-center gap-4 my-2">
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl font-black text-blue-600 leading-none">
                    {m1ActiveSlices}
                  </span>
                  <div className="w-16 h-2.5 bg-slate-900 rounded-full my-1"></div>
                  <span className="text-4xl sm:text-5xl font-black text-amber-500 leading-none">
                    {m1BaseDen}
                  </span>
                </div>

                <div className="text-left text-xs sm:text-sm font-bold text-slate-700 pl-3 border-l-2 border-slate-300 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span className="inline-block w-3.5 h-3.5 bg-blue-500 rounded-full border border-slate-900"></span>
                    <span><strong>{m1ActiveSlices}</strong> rebanadas con queso</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="inline-block w-3.5 h-3.5 bg-amber-500 rounded-full border border-slate-900"></span>
                    <span>Cortes totales: <strong>{m1BaseDen}</strong></span>
                  </p>
                </div>
              </div>

              {/* Barra de volumen fija según porcentaje real */}
              {(() => {
                const percent = Math.round((m1ActiveSlices / m1BaseDen) * 100);
                return (
                  <div className="w-full bg-slate-200 rounded-full h-5 border-2 border-slate-900 overflow-hidden mt-1 relative">
                    <div
                      className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 h-full transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${percent}%` }}
                    >
                      <span className="text-[10px] font-black text-slate-900 tracking-wide">
                        {percent}% PIZZA
                      </span>
                    </div>
                  </div>
                );
              })()}
              <span className="text-[11px] font-bold text-slate-600 mt-1">
                La barra mide la pizza real: ¡Al partir a la mitad la cantidad es equivalente!
              </span>
            </div>

            {/* Botón de Corte Asistido y selector de rebanadas */}
            <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleM1SliceCutDouble}
                disabled={m1BaseDen >= 8}
                className={`flex-1 py-3 px-4 min-h-[48px] rounded-2xl border-4 border-slate-900 font-black text-base comic-shadow-sm comic-shadow-active flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  m1BaseDen >= 8
                    ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                    : 'bg-emerald-400 hover:bg-emerald-300'
                }`}
              >
                <span>🔪 Cuchillo Asistido (Cortar x2)</span>
              </button>

              <button
                onClick={() => {
                  playPop(450);
                  setM1ShowAssisted(!m1ShowAssisted);
                }}
                className="py-3 px-4 min-h-[48px] bg-white hover:bg-slate-100 rounded-2xl border-4 border-slate-900 font-black text-sm comic-shadow-sm comic-shadow-active cursor-pointer"
              >
                {m1ShowAssisted ? 'Ocultar Guías' : 'Mostrar Guías'}
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ */}
        {/* MODO 2: COCINA DE SUMAS BÁSICAS (MISMO DENOMINADOR) */}
        {/* ------------------------------------------------------------ */}
        {currentMode === 2 && (
          <section className="flex-1 bg-[#bae6fd] rounded-3xl border-4 border-slate-900 comic-shadow p-4 sm:p-6 flex flex-col items-center justify-between relative overflow-hidden">
            {m2ShowCelebration && <CelebrationStars />}

            {/* Bocadillo guiado */}
            <div className="flex items-center gap-3 w-full max-w-xl bg-white p-3.5 rounded-2xl border-4 border-slate-900 mb-3 shadow-sm z-10">
              <span className="text-3xl flex-shrink-0">👾</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                "¡Ambos platos tienen el mismo tamaño de trozos (<strong>/{m2Den}</strong>)! Toca los platos o el botón para juntar las rebanadas en la Caja de Entrega."
              </p>
            </div>

            {/* Platos y Caja */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 my-2 z-10">
              {/* Plato A */}
              <div
                onClick={handleM2AddA}
                className={`flex flex-col items-center bg-white/90 p-3 rounded-2xl border-4 border-slate-900 transition-all ${
                  !m2AddedA ? 'cursor-pointer hover:scale-105 comic-shadow-sm' : 'opacity-40'
                }`}
              >
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-200 border-4 border-slate-900"></div>
                  <PizzaSVG
                    totalSlices={m2Den}
                    activeSlices={m2AddedA ? 0 : m2NumA}
                    sliceColor="#60a5fa"
                    crustColor="#d97706"
                    className="w-32 h-32 relative z-10"
                  />
                </div>
                <span className="mt-2 text-2xl font-black text-blue-600 bg-white px-3 py-1 rounded-xl border-2 border-slate-900">
                  {m2NumA}/{m2Den}
                </span>
                <span className="text-[11px] font-bold text-slate-700 mt-1">
                  {m2AddedA ? '¡En la caja! ✔️' : '👉 Toca para poner'}
                </span>
              </div>

              {/* Signo + */}
              <div className="w-12 h-12 bg-pink-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white text-3xl font-black comic-shadow-sm flex-shrink-0">
                +
              </div>

              {/* Plato B */}
              <div
                onClick={handleM2AddB}
                className={`flex flex-col items-center bg-white/90 p-3 rounded-2xl border-4 border-slate-900 transition-all ${
                  !m2AddedB ? 'cursor-pointer hover:scale-105 comic-shadow-sm' : 'opacity-40'
                }`}
              >
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-200 border-4 border-slate-900"></div>
                  <PizzaSVG
                    totalSlices={m2Den}
                    activeSlices={m2AddedB ? 0 : m2NumB}
                    sliceColor="#c084fc"
                    crustColor="#d97706"
                    className="w-32 h-32 relative z-10"
                  />
                </div>
                <span className="mt-2 text-2xl font-black text-purple-600 bg-white px-3 py-1 rounded-xl border-2 border-slate-900">
                  {m2NumB}/{m2Den}
                </span>
                <span className="text-[11px] font-bold text-slate-700 mt-1">
                  {m2AddedB ? '¡En la caja! ✔️' : '👉 Toca para poner'}
                </span>
              </div>

              {/* Flecha */}
              <div className="text-3xl font-black text-slate-800">➡️</div>

              {/* Caja de Entrega */}
              <div
                onClick={handleM2CombineAll}
                className="flex flex-col items-center bg-amber-100 p-3 rounded-2xl border-4 border-slate-900 comic-shadow-sm min-w-[190px] cursor-pointer hover:bg-amber-200/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-900 uppercase">Caja de Entrega</span>
                  <span>📦</span>
                </div>
                <div className="relative w-36 h-36 flex items-center justify-center my-1 bg-amber-50 rounded-xl border-2 border-dashed border-amber-900/40">
                  {m2CurrentInBox > 0 ? (
                    <PizzaSVG
                      totalSlices={m2Den}
                      activeSlices={m2CurrentInBox}
                      sliceColor="#34d399"
                      crustColor="#ea580c"
                      className="w-32 h-32 relative z-10 pop-in"
                    />
                  ) : (
                    <div className="absolute text-center text-xs text-amber-900/80 font-bold px-3 pointer-events-none">
                      Toca aquí o los platos para juntarlas
                    </div>
                  )}
                </div>
                <div
                  className={`mt-1 text-2xl font-black px-4 py-0.5 rounded-xl border-2 border-slate-900 transition-all ${
                    m2CurrentInBox === m2TargetSum
                      ? 'text-emerald-700 bg-emerald-200 scale-105'
                      : m2CurrentInBox > 0
                      ? 'text-blue-600 bg-white'
                      : 'text-slate-500 bg-white opacity-40'
                  }`}
                >
                  {m2CurrentInBox > 0 ? `${m2CurrentInBox}/${m2Den}` : '? / ?'}
                </div>
              </div>
            </div>

            {/* Controles de Acción */}
            <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 items-center justify-center mt-2 z-10">
              <button
                onClick={handleM2CombineAll}
                className="w-full sm:w-auto flex-1 py-3 px-4 min-h-[48px] bg-emerald-400 hover:bg-emerald-300 text-slate-900 border-4 border-slate-900 rounded-2xl font-black text-base comic-shadow-sm comic-shadow-active flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📦 Juntar en la Caja</span>
              </button>

              <button
                onClick={handleM2Randomize}
                className="w-full sm:w-auto py-3 px-5 min-h-[48px] bg-white hover:bg-slate-100 text-slate-900 border-4 border-slate-900 rounded-2xl font-black text-sm comic-shadow-sm comic-shadow-active cursor-pointer"
              >
                🎲 Generar Nueva Suma
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ */}
        {/* MODO 3: LA FIESTA DE LAS RESTAS (COMER REBANADAS) */}
        {/* ------------------------------------------------------------ */}
        {currentMode === 3 && (
          <section className="flex-1 bg-[#fed7aa] rounded-3xl border-4 border-slate-900 comic-shadow p-4 sm:p-6 flex flex-col items-center justify-between">
            {/* Mensaje guiado con hambre cómica */}
            <div className="flex items-center gap-3 w-full max-w-xl bg-white p-3.5 rounded-2xl border-4 border-slate-900 mb-3 shadow-sm">
              <span className="text-3xl flex-shrink-0 animate-bounce">😋</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                "¡El Chef Monstruito tiene hambre! Quiere comerse <strong className="text-red-600">{m3TargetToEat} rebanadas</strong> ({m3TargetToEat}/{m3Den}). <strong>Toca las rebanadas</strong> para que se las coma: ¡Ñam!"
              </p>
            </div>

            {/* Plato Central con rebanadas interactivas */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-1">
              <div className="absolute inset-0 rounded-full bg-amber-300 border-4 border-slate-900 comic-shadow-sm flex items-center justify-center">
                <div className="w-11/12 h-11/12 rounded-full border-4 border-dashed border-amber-600 opacity-40"></div>
              </div>

              <PizzaSVG
                totalSlices={m3Den}
                activeSlices={m3Remaining}
                sliceColor="#f59e0b"
                crustColor="#b45309"
                emptyColor="#fef3c7"
                interactive={true}
                onSliceClick={handleM3SliceClick}
                className="w-56 h-56 sm:w-72 sm:h-72 relative z-10 filter drop-shadow-md"
              />

              {/* Indicador de rebanadas comidas */}
              <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black px-3 py-1 rounded-full border-3 border-slate-900 text-xs shadow-md">
                Comidas: {m3EatenSlices.length} / {m3TargetToEat} 🍕
              </div>
            </div>

            {/* Panel Numérico de Resta Visual */}
            <div className="flex flex-col items-center bg-white px-6 py-3 rounded-2xl border-4 border-slate-900 comic-shadow-sm mb-3 w-full max-w-lg">
              <div className="flex items-center gap-3 sm:gap-4 my-1">
                {/* Fracción Inicial */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600">{m3InitialNum}</span>
                  <div className="w-12 h-2 bg-slate-900 rounded-full my-0.5"></div>
                  <span className="text-3xl sm:text-4xl font-black text-amber-500">{m3Den}</span>
                </div>

                {/* Signo MENOS */}
                <span className="text-3xl font-black text-pink-600">-</span>

                {/* Fracción Comida */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black text-red-600">{m3EatenSlices.length}</span>
                  <div className="w-12 h-2 bg-slate-900 rounded-full my-0.5"></div>
                  <span className="text-3xl sm:text-4xl font-black text-amber-500">{m3Den}</span>
                </div>

                {/* Signo IGUAL */}
                <span className="text-3xl font-black text-slate-800">=</span>

                {/* Resultado */}
                <div className="flex flex-col items-center bg-emerald-100 px-3 py-1 rounded-xl border-2 border-slate-900">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-700">{m3Remaining}</span>
                  <div className="w-12 h-2 bg-slate-900 rounded-full my-0.5"></div>
                  <span className="text-3xl sm:text-4xl font-black text-amber-600">{m3Den}</span>
                </div>
              </div>

              {/* Comprobación de simplificación si aplica (ej. 3/6 = 1/2) */}
              {m3Remaining > 0 && m3Remaining / m3Den === 0.5 && (
                <div className="mt-2 text-xs font-black text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full border border-slate-900">
                  💡 ¡Mira! {m3Remaining}/{m3Den} equivale exactamente a la mitad: <strong>1/2</strong>
                </div>
              )}
            </div>

            {/* Controles de Resta */}
            <div className="w-full max-w-md flex gap-3">
              <button
                onClick={handleM3Reset}
                className="flex-1 py-3 px-4 min-h-[48px] bg-white hover:bg-slate-100 rounded-2xl border-4 border-slate-900 font-black text-sm comic-shadow-sm comic-shadow-active cursor-pointer"
              >
                🔄 Restaurar Pizza
              </button>

              <button
                onClick={handleM3NewChallenge}
                className="flex-1 py-3 px-4 min-h-[48px] bg-amber-400 hover:bg-amber-300 rounded-2xl border-4 border-slate-900 font-black text-sm comic-shadow-sm comic-shadow-active cursor-pointer"
              >
                🎲 Otro Reto de Resta
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ */}
        {/* MODO 4: SUMAS AVANZADAS (DIFERENTE DENOMINADOR Y EQUIVALENCIA) */}
        {/* ------------------------------------------------------------ */}
        {currentMode === 4 && (
          <section className="flex-1 bg-[#bae6fd] rounded-3xl border-4 border-slate-900 comic-shadow p-4 sm:p-6 flex flex-col items-center justify-between relative overflow-hidden">
            {m4Celebration && <CelebrationStars />}

            {/* Bocadillo guiado */}
            <div className="flex items-center gap-3 w-full max-w-xl bg-white p-3.5 rounded-2xl border-4 border-slate-900 mb-3 shadow-sm z-10">
              <div className="w-10 h-10 flex-shrink-0 bg-purple-500 rounded-xl border-2 border-slate-900 flex items-center justify-center text-lg">
                👾
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                {!m4IsSlicedA ? (
                  <span>
                    "¡Alto! Los trozos son de tamaños distintos ({currentM4Preset.name}). Toca el botón amarillo <strong className="text-amber-600 underline">🔪 Cortar y Emparejar</strong> para igualarlos."
                  </span>
                ) : (
                  <span>
                    "¡Perfecto! Ahora ambos platos son del mismo tamaño (<strong>/{commonDen}</strong>). ¡Toca las rebanadas o el botón para ponerlas en la caja!"
                  </span>
                )}
              </p>
            </div>

            {/* Selector de Presets / Retos Populares */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2 z-10">
              <span className="text-xs font-black text-slate-700 uppercase">Elegir Reto:</span>
              {presetsM4.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleM4SelectPreset(idx)}
                  className={`px-3 py-1.5 min-h-[40px] rounded-xl border-3 border-slate-900 font-black text-xs cursor-pointer transition-all ${
                    m4Index === idx
                      ? 'bg-amber-400 comic-shadow-sm scale-105'
                      : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Zona de Trabajo: Platos y Caja */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 my-2 z-10">
              {/* PLATO A */}
              <div
                onClick={handleM4AddA}
                className={`flex flex-col items-center bg-white/90 p-3 rounded-2xl border-4 border-slate-900 transition-all ${
                  m4IsSlicedA && !m4AddedA ? 'cursor-pointer hover:scale-105 comic-shadow-sm' : ''
                } ${m4AddedA ? 'opacity-40' : ''}`}
              >
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-200 border-4 border-slate-900"></div>
                  {!m4IsSlicedA ? (
                    <PizzaSVG
                      totalSlices={currentM4Preset.denA}
                      activeSlices={currentM4Preset.numA}
                      sliceColor="#60a5fa"
                      crustColor="#d97706"
                      className="w-32 h-32 relative z-10"
                    />
                  ) : (
                    <PizzaSVG
                      totalSlices={commonDen}
                      activeSlices={m4AddedA ? 0 : convertedNumA}
                      sliceColor="#60a5fa"
                      crustColor="#d97706"
                      className="w-32 h-32 relative z-10 pop-in"
                    />
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-2xl font-black bg-white px-3 py-1 rounded-xl border-2 border-slate-900 ${
                      !m4IsSlicedA ? 'text-blue-600' : 'text-emerald-600'
                    }`}
                  >
                    {!m4IsSlicedA
                      ? `${currentM4Preset.numA}/${currentM4Preset.denA}`
                      : `${convertedNumA}/${commonDen}`}
                  </span>

                  {!m4IsSlicedA && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleM4CutAndMatch();
                      }}
                      className={`bg-yellow-400 hover:bg-yellow-300 text-xs font-black py-1.5 px-2.5 rounded-xl border-2 border-slate-900 comic-shadow-sm comic-shadow-active flex items-center gap-1 cursor-pointer transition-all ${
                        m4CutBouncing ? 'animate-bounce ring-4 ring-pink-400 scale-110' : ''
                      }`}
                    >
                      <span>🔪 Cortar y Emparejar</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1">
                  {!m4IsSlicedA
                    ? 'Rebanadas grandes'
                    : m4AddedA
                    ? '¡En la caja! ✔️'
                    : '👉 Toca para poner en la caja'}
                </span>
              </div>

              {/* Signo + */}
              <div className="w-12 h-12 bg-pink-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white text-3xl font-black comic-shadow-sm flex-shrink-0">
                +
              </div>

              {/* PLATO B */}
              <div
                onClick={handleM4AddB}
                className={`flex flex-col items-center bg-white/90 p-3 rounded-2xl border-4 border-slate-900 transition-all ${
                  m4IsSlicedA && !m4AddedB ? 'cursor-pointer hover:scale-105 comic-shadow-sm' : ''
                } ${m4AddedB ? 'opacity-40' : ''}`}
              >
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-200 border-4 border-slate-900"></div>
                  <PizzaSVG
                    totalSlices={currentM4Preset.denB}
                    activeSlices={m4AddedB ? 0 : currentM4Preset.numB}
                    sliceColor="#c084fc"
                    crustColor="#d97706"
                    className="w-32 h-32 relative z-10"
                  />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-purple-600 bg-white px-3 py-1 rounded-xl border-2 border-slate-900">
                    {currentM4Preset.numB}/{currentM4Preset.denB}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1">
                  {m4AddedB ? '¡En la caja! ✔️' : m4IsSlicedA ? '👉 Toca para poner en la caja' : 'Rebanadas ya en medida'}
                </span>
              </div>

              {/* Flecha */}
              <div className="text-3xl font-black text-slate-800">➡️</div>

              {/* CAJA DE ENTREGA */}
              <div
                onClick={handleM4CombineAll}
                className="flex flex-col items-center bg-amber-100 p-3 rounded-2xl border-4 border-slate-900 comic-shadow-sm min-w-[190px] cursor-pointer hover:bg-amber-200/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-900 uppercase">Caja de Entrega</span>
                  <span>📦</span>
                </div>
                <div className="relative w-36 h-36 flex items-center justify-center my-1 bg-amber-50 rounded-xl border-2 border-dashed border-amber-900/40">
                  {m4CurrentInBox > 0 ? (
                    <PizzaSVG
                      totalSlices={commonDen}
                      activeSlices={m4CurrentInBox}
                      sliceColor="#34d399"
                      crustColor="#ea580c"
                      className="w-32 h-32 relative z-10 pop-in"
                    />
                  ) : (
                    <div className="absolute text-center text-xs text-amber-900/80 font-bold px-3 pointer-events-none">
                      Toca "Juntar en la Caja" o los platos
                    </div>
                  )}
                </div>
                <div
                  className={`mt-1 text-2xl font-black px-4 py-0.5 rounded-xl border-2 border-slate-900 transition-all ${
                    m4CurrentInBox === m4TargetSum
                      ? 'text-emerald-700 bg-emerald-200 scale-105'
                      : m4CurrentInBox > 0
                      ? 'text-blue-600 bg-white'
                      : 'text-slate-500 bg-white opacity-40'
                  }`}
                >
                  {m4CurrentInBox > 0 ? `${m4CurrentInBox}/${commonDen}` : '? / ?'}
                </div>
              </div>
            </div>

            {/* Controles de Acción */}
            <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 items-center justify-center mt-2 z-10">
              <button
                onClick={handleM4CombineAll}
                className="w-full sm:w-auto flex-1 py-3 px-4 min-h-[48px] bg-emerald-400 hover:bg-emerald-300 text-slate-900 border-4 border-slate-900 rounded-2xl font-black text-base comic-shadow-sm comic-shadow-active flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📦 Juntar en la Caja</span>
              </button>

              <button
                onClick={() => handleM4SelectPreset((m4Index + 1) % presetsM4.length)}
                className="w-full sm:w-auto py-3 px-5 min-h-[48px] bg-white hover:bg-slate-100 text-slate-900 border-4 border-slate-900 rounded-2xl font-black text-sm comic-shadow-sm comic-shadow-active cursor-pointer"
              >
                Siguiente Reto 🚀
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================ */}
      {/* PIE DE PÁGINA */}
      {/* ============================================================ */}
      <footer className="mt-3 text-center text-xs font-bold text-slate-800">
        Diseñado con amor y cuidado sensorial para campeones matemáticos 🍕✨
      </footer>
    </div>
  );
}

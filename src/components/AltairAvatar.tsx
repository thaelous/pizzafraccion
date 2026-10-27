import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2 } from 'lucide-react';

export interface AltairAvatarProps {
  emotion: 'idle' | 'celebrate' | 'eating';
  speech?: string;
  isMuted?: boolean;
  autoSpeak?: boolean;
}

export const AltairAvatar: React.FC<AltairAvatarProps> = ({
  emotion,
  speech,
  isMuted = false,
  autoSpeak = false,
}) => {
  const [idleState, setIdleState] = useState<'cerrada' | 'sonrisa'>('cerrada');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Parpadeo / cambio de expresión en reposo
  useEffect(() => {
    if (emotion !== 'idle') return;
    const interval = setInterval(() => {
      setIdleState((prev) => (prev === 'cerrada' ? 'sonrisa' : 'cerrada'));
    }, 2800);
    return () => clearInterval(interval);
  }, [emotion]);

  // Carga y selección de voces de SpeechSynthesis en español
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          voicesRef.current = availableVoices;
        }
      } catch (err) {
        console.warn('No se pudieron obtener voces de speechSynthesis:', err);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Función para seleccionar la mejor voz infantil / amable en español
  const getSpanishVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices =
      voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis.getVoices();

    if (!voices || voices.length === 0) return null;

    // Buscar voces en español
    const spanishVoices = voices.filter(
      (v) =>
        v.lang &&
        (v.lang.toLowerCase().startsWith('es') ||
          v.lang.toLowerCase().includes('es-') ||
          v.lang.toLowerCase().includes('es_'))
    );

    if (spanishVoices.length === 0) return null;

    // Preferir voces femeninas o de alta calidad conocidas que suenan más dulces/infantiles
    const preferredNames = [
      'sabina',
      'monica',
      'mónica',
      'paulina',
      'paloma',
      'luciana',
      'laura',
      'mia',
      'sofia',
      'sofía',
      'google español',
      'es-es',
      'es-mx',
    ];

    for (const name of preferredNames) {
      const found = spanishVoices.find(
        (v) =>
          v.name.toLowerCase().includes(name) ||
          v.lang.toLowerCase().includes(name)
      );
      if (found) return found;
    }

    return spanishVoices[0];
  }, []);

  // Función de locución con Web Speech API
  const speakText = useCallback(
    (textToSpeak: string) => {
      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        isMuted ||
        !textToSpeak ||
        !textToSpeak.trim()
      ) {
        return;
      }

      try {
        // Cancelar locución anterior para evitar superposiciones
        window.speechSynthesis.cancel();

        // Limpiar el texto de emojis para que la voz no los lea de forma extraña
        const cleanText = textToSpeak
          .replace(
            /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu,
            ''
          )
          .replace(/[➕➖⚡🎯⭐🎉✅⏳]/g, '')
          .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);

        const voice = getSpanishVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = 'es-ES';
        }

        // Tono infantil amable y velocidad comprensible para un niño
        utterance.pitch = 1.28; // Tono ligeramente más agudo e infantil (1.28)
        utterance.rate = 0.98; // Ritmo pausado y claro para comprensión óptima
        utterance.volume = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
        };

        utterance.onerror = (e) => {
          // Si fue cancelado voluntariamente, no es un error
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('Error en SpeechSynthesis:', e.error);
          }
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('No se pudo reproducir el habla con Web Speech API:', err);
        setIsSpeaking(false);
      }
    },
    [getSpanishVoice, isMuted]
  );

  // Leer en voz alta automáticamente cuando el texto de Altair cambie (si autoSpeak está activo)
  useEffect(() => {
    if (autoSpeak && speech && !isMuted) {
      // Pequeño retardo de 120ms para que la UI termine de montar y no choque con SFX
      const timer = setTimeout(() => {
        speakText(speech);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [speech, isMuted, speakText, autoSpeak]);

  // Si se silencia, detener de inmediato cualquier reproducción en curso
  useEffect(() => {
    if (isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isMuted]);

  let currentImg: string;
  if (emotion === 'celebrate') {
    currentImg = 'altairojo.png';
  } else if (emotion === 'eating' || isSpeaking) {
    // Si está hablando o comiendo, muestra expresión alegre de boca abierta
    currentImg = 'altairsonrisa.png';
  } else {
    currentImg = idleState === 'sonrisa' ? 'altairsonrisa.png' : 'altaircerrada.png';
  }

  return (
    <div className="flex items-center gap-2 select-none min-w-0">
      {/* Sprite ampliado de Altair (>72-85px en móvil, >100px en PC) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div
          className={`w-[74px] h-[74px] sm:w-[104px] sm:h-[104px] rounded-2xl bg-amber-300/40 border-2 sm:border-3 border-slate-900 p-1 flex items-center justify-center shadow-[2px_2px_0_#0f172a] transition-all ${
            isSpeaking ? 'ring-2 ring-amber-500 scale-105' : ''
          }`}
        >
          <img
            src={currentImg}
            alt="Altair"
            className={`w-full h-full object-contain drop-shadow-sm select-none transition-transform duration-300 ${
              emotion === 'celebrate'
                ? 'scale-110 -rotate-2'
                : isSpeaking
                ? 'scale-105'
                : ''
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        {emotion === 'celebrate' && (
          <div className="absolute -top-1 -right-1 text-base sm:text-xl animate-bounce">⭐</div>
        )}
      </div>

      {/* Globo de habla de Altair con texto pedagógico correcto y botón de repetir locución */}
      {speech && (
        <div className="bg-white border-2 sm:border-3 border-slate-900 rounded-2xl py-1.5 px-3 text-xs sm:text-sm font-bold text-slate-800 shadow-[3px_3px_0px_#0f172a] relative max-w-[240px] sm:max-w-md leading-snug flex items-center gap-2">
          <div className="absolute left-[-7px] top-4 w-0 h-0 border-t-5 border-t-transparent border-b-5 border-b-transparent border-r-7 border-r-slate-900" />
          <div className="absolute left-[-5px] top-4 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-5 border-r-white" />
          
          <span className="flex-1 min-w-0">{speech}</span>

          {/* Botón táctil para que el niño vuelva a escuchar la indicación cuando quiera */}
          <button
            type="button"
            onClick={() => speakText(speech)}
            disabled={isMuted}
            title={isMuted ? 'Sonido silenciado' : 'Escuchar de nuevo'}
            className={`shrink-0 p-1 rounded-lg border border-slate-900 transition-all ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 scale-110 animate-pulse'
                : isMuted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-200 hover:bg-amber-300 text-slate-900 active:scale-95'
            }`}
            aria-label="Escuchar mensaje de Altair"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

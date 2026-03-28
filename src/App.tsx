import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  RefreshCw, 
  PenTool, 
  Award, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Search,
  Library,
  Volume2,
  Mic,
  Download,
  CheckCircle2,
  XCircle,
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  History,
  Trash2,
  Sparkles,
  Zap,
  Star,
  Smile,
  Calendar,
  Flower2,
  TrendingUp,
  Bell,
  Leaf,
  Sparkle,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { wordService, sessionService, noteService } from './services/dataService';
import { analyzeWords, generateStoryAndPodcast, evaluateSentence, evaluateWriting, generateClozeTests, generatePodcastAudio, generateReviewPodcast, generateSentencePrompt, generateWritingPrompt, generateWritingReport, generateMistakeAnalysis, generateWordAnalysis, generateStatsEvaluation } from './services/geminiService';
import { Word, LearningSession, SentenceNote, WritingNote } from './types';
import { format, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Sound Effects ---
const playCrispBellSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn('AudioContext not supported or blocked');
  }
};

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pcmToWav = (pcmBase64: string, sampleRate: number = 24000): string => {
  const binaryString = window.atob(pcmBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, len, true);

  const wavBytes = new Uint8Array(44 + len);
  wavBytes.set(new Uint8Array(wavHeader), 0);
  wavBytes.set(bytes, 44);

  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

// --- Components ---

const BellButton = ({ onClick, isActive }: { onClick: () => void; isActive: boolean }) => {
  return (
    <motion.button
      onClick={() => {
        playCrispBellSound();
        onClick();
      }}
      whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
      whileTap={{ scale: 0.9 }}
      className="relative w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center group"
    >
      {/* Golden Bell Glow */}
      <motion.div
        animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-2xl"
      />
      
      {/* Bell Body - More Golden and Detailed */}
      <div className={cn(
        "relative z-10 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#9F7928] border-[4px] border-brand-black rounded-[50%_50%_15%_15%] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden",
        isActive && "animate-wiggle"
      )}>
        {/* Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="absolute top-1 left-4 w-4 h-8 bg-white/30 rounded-full blur-[2px] rotate-12" />
        
        <Bell className={cn("w-8 h-8 sm:w-12 sm:h-12 drop-shadow-md", isActive ? "text-white" : "text-brand-black/40")} />
        
        {/* Intricate Rim */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-brand-black/20 border-t border-white/20" />
      </div>

      {/* Bell Handle - Detailed Brass */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 sm:w-5 sm:h-8 bg-gradient-to-r from-[#8B4513] to-[#5D2E0C] border-[3px] border-brand-black rounded-t-full z-0 shadow-sm">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/20 rounded-full" />
      </div>

      {/* Floating Text */}
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-8 sm:-left-16 top-1/2 -translate-y-1/2 font-black text-sm sm:text-2xl uppercase tracking-tighter text-brand-black drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]"
      >
        Daily
      </motion.div>
      <motion.div 
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-6 sm:-right-14 top-1/2 -translate-y-1/2 font-black text-sm sm:text-2xl uppercase tracking-tighter text-brand-black drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]"
      >
        Win
      </motion.div>
      
      {/* Sparkles around the bell */}
      <motion.div
        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className="absolute top-0 right-0 text-yellow-500"
      >
        <Sparkle className="w-4 h-4 fill-current" />
      </motion.div>
      <motion.div
        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
        className="absolute bottom-4 left-0 text-yellow-500"
      >
        <Sparkle className="w-3 h-3 fill-current" />
      </motion.div>
    </motion.button>
  );
};

const TypewriterInput = ({ value, onChange, onImport, isAnalyzing }: any) => {
  return (
    <div className="relative pt-12 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-8 bg-[#FDFCF8] border-[4px] sm:border-[6px] border-[#8B4513] rounded-b-[30px] sm:rounded-b-[40px] shadow-[8px_8px_0px_0px_rgba(139,69,19,0.2)]">
      {/* Typewriter Top Bar - Classical Ivory/Gold */}
      <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 bg-[#E5D3B3] border-b-[3px] sm:border-b-[4px] border-[#8B4513] flex items-center px-4 sm:px-6 justify-between rounded-t-lg">
        <div className="flex gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#8B4513]" />
          <div className="w-2.5 h-2.5 sm:w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#8B4513]" />
          <div className="w-2.5 h-2.5 sm:w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#8B4513]" />
        </div>
        <div className="text-[8px] sm:text-[10px] font-serif font-bold text-[#8B4513] uppercase tracking-[0.1em] sm:tracking-[0.2em]">Royal Standard • MCMXXIV</div>
      </div>

      {/* The Lever (拨杆) - Brass/Gold style */}
      <motion.button
        whileHover={{ x: 8 }}
        whileTap={{ x: 25, rotate: 8 }}
        onClick={onImport}
        disabled={isAnalyzing || !value.trim()}
        className="absolute -right-3 sm:-right-6 top-14 sm:top-16 w-10 sm:w-14 h-20 sm:h-28 bg-gradient-to-b from-[#D4AF37] to-[#B8860B] border-3 sm:border-4 border-[#8B4513] rounded-r-full shadow-[4px_4px_0px_0px_rgba(139,69,19,0.3)] flex items-center justify-center group disabled:opacity-50 z-30"
      >
        <div className="w-2 sm:w-3 h-14 sm:h-20 bg-[#FFD700] border-r border-[#8B4513]/30 rounded-full" />
        <div className="absolute -top-2 sm:-top-3 right-0 w-6 sm:w-8 h-6 sm:h-8 bg-[#8B4513] border-3 sm:border-4 border-[#D4AF37] rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
        </div>
        <div className="absolute bottom-2 sm:bottom-4 right-full mr-2 sm:mr-4 bg-[#FDFCF8] border-2 border-[#8B4513] px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-serif font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-md pointer-events-none">
          Engage
        </div>
      </motion.button>

      {/* Paper Area - Elegant Cream */}
      <div className="bg-[#FFFDF5] border-[3px] sm:border-[4px] border-[#8B4513] p-4 sm:p-6 shadow-inner min-h-[180px] sm:min-h-[220px] relative overflow-hidden rounded-xl">
        {/* Paper Texture Lines - Subtle Sepia */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#8B4513 1px, transparent 1px)', backgroundSize: '100% 28px' }} />
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Compose your thoughts..."
          className="w-full h-36 sm:h-44 bg-transparent border-none focus:outline-none font-serif text-lg sm:text-xl italic text-[#5D4037] placeholder:text-[#8B4513]/20 relative z-10 resize-none leading-[28px]"
        />
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-10 h-10 animate-spin text-[#D4AF37]" />
              <span className="text-xs font-serif font-black uppercase tracking-widest text-[#8B4513]">Transcribing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Typewriter Keys Decor - Elegant Round Keys */}
      <div className="mt-8 flex justify-center gap-5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-10 h-10 bg-[#E5D3B3] border-[3px] border-[#8B4513] rounded-full shadow-[0_6px_0_0_#8B4513] flex items-center justify-center">
            <div className="w-6 h-6 border border-[#8B4513]/20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

const PodcastPlayer = ({ script, title }: { script: string; title: string }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (!audioUrl) {
      setIsLoading(true);
      try {
        const response = await generatePodcastAudio(script);
        const base64 = response.includes('base64,') ? response.split('base64,')[1] : response;
        const url = pcmToWav(base64);
        setAudioUrl(url);
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100);
        });
        audio.addEventListener('ended', () => setIsPlaying(false));
        
        audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border-4 border-brand-black p-4 sm:p-8 space-y-6 relative overflow-hidden group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent/5 rounded-full -ml-16 -mb-16 blur-3xl" />

      <div className="flex flex-col items-center sm:items-stretch gap-6 sm:gap-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full">
          {/* Album Art / Spinning Disc - Responsive sizing */}
          <div className="relative shrink-0">
            <motion.div 
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 xs:w-40 xs:h-40 sm:w-56 sm:h-56 bg-zinc-900 rounded-full border-4 sm:border-8 border-brand-black flex items-center justify-center relative shadow-2xl overflow-hidden"
            >
              {/* Vinyl Texture - More pronounced */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
              <div className="absolute inset-0 opacity-20 bg-[repeating-radial-gradient(circle_at_center,_black_0,_black_1px,_transparent_1px,_transparent_6px)]" />
              
              {/* Center Label */}
              <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 bg-brand-secondary rounded-full border-2 sm:border-4 border-brand-black flex items-center justify-center z-10 shadow-inner">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent absolute inset-0" />
                <Volume2 className="w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 text-brand-black drop-shadow-lg" />
              </div>
              
              {/* Center Hole */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-brand-black rounded-full z-20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]" />
              </div>
            </motion.div>
            
            {/* Playback Indicator Glow - Larger and more atmospheric */}
            {isPlaying && (
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-4 bg-brand-secondary/15 rounded-full blur-3xl -z-10"
              />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 sm:space-y-3 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-brand-secondary text-brand-black text-[9px] sm:text-xs font-black uppercase tracking-widest rounded-full shadow-lg">Now Playing</span>
              <div className="flex items-end gap-1 h-3 sm:h-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div 
                    key={i}
                    animate={isPlaying ? { height: [4, 12, 4] } : { height: 4 }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                    className="w-1 sm:w-1.5 bg-brand-secondary rounded-full shadow-[0_0_8px_rgba(0,224,255,0.5)]"
                  />
                ))}
              </div>
            </div>
            <h4 className="text-white font-black uppercase text-xl sm:text-4xl break-words tracking-tighter leading-tight">{title}</h4>
            <p className="text-zinc-500 font-mono text-[10px] sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold">AI Generated Experience</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative h-2 bg-zinc-800 border-2 border-brand-black rounded-full overflow-hidden group/progress cursor-pointer">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-brand-secondary" 
            style={{ width: `${progress}%` }}
          />
          {/* Hover highlight */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs font-mono text-zinc-500 font-bold">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <button 
          onClick={handleReplay}
          className="text-zinc-400 hover:text-brand-secondary transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
          disabled={!audioUrl}
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button 
          onClick={handlePlay}
          disabled={isLoading}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-secondary border-4 border-brand-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group/play"
        >
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-brand-black border-t-transparent animate-spin rounded-full" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black fill-current" />
          ) : (
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black fill-current ml-1" />
          )}
        </button>

        <button 
          onClick={handleForward}
          className="text-zinc-400 hover:text-brand-secondary transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
          disabled={!audioUrl}
        >
          <FastForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const handleClick = (e: any) => {
    if (props.onClick) props.onClick(e);
  };

  const variants: any = {
    primary: 'candy-button bg-candy-sky text-brand-black',
    secondary: 'candy-button bg-candy-pink text-brand-black',
    outline: 'candy-button bg-white text-brand-black',
    ghost: 'bg-transparent text-brand-black font-bold hover:bg-brand-muted px-4 py-2 rounded-lg',
  };
  return (
    <button 
      className={cn('flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap', variants[variant], className)} 
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, noPadding = false, ...props }: any) => (
  <div className={cn('candy-card relative overflow-hidden bg-white', !noPadding && 'p-4 sm:p-6', className)} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const variants: any = {
    default: 'bg-brand-muted text-brand-black border-2 border-brand-black',
    accent: 'bg-brand-accent text-white border-2 border-brand-black',
    secondary: 'bg-brand-secondary text-brand-black border-2 border-brand-black',
  };
  return (
    <span className={cn('px-3 py-1 text-xs font-black uppercase tracking-tighter', variants[variant])}>
      {children}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [words, setWords] = useState<Word[]>([]);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showReviewAnswer, setShowReviewAnswer] = useState(false);
  const [importText, setImportText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScriptVisible, setIsScriptVisible] = useState(false);
  const [session, setSession] = useState<LearningSession | null>(null);
  const [reviewedWordsInSession, setReviewedWordsInSession] = useState<string[]>([]);
  const [reviewPodcast, setReviewPodcast] = useState<string | null>(null);
  const [reviewPodcastTheme, setReviewPodcastTheme] = useState<string | null>(null);
  const [isGeneratingReviewPodcast, setIsGeneratingReviewPodcast] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [visibleTranslations, setVisibleTranslations] = useState<string[]>([]);
  const [allSessions, setAllSessions] = useState<LearningSession[]>([]);
  const [sentenceNotes, setSentenceNotes] = useState<SentenceNote[]>([]);
  const [writingNotes, setWritingNotes] = useState<WritingNote[]>([]);

  useEffect(() => {
    fetchData();
    
    // Load persistent podcast if it exists and is from today
    const savedPodcast = localStorage.getItem('wordflourish_daily_podcast');
    if (savedPodcast) {
      const { script, theme, date } = JSON.parse(savedPodcast);
      const today = new Date().toDateString();
      if (date === today) {
        setReviewPodcast(script);
        setReviewPodcastTheme(theme);
      }
    }

    if (activeTab === 'review') {
      setCurrentReviewIndex(0);
      setShowReviewAnswer(false);
      setReviewedWordsInSession([]);
    }
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoadingReview(true);
    try {
      const allWords = await wordService.getAllWords();
      const toReview = await wordService.getWordsToReview();
      const latestSession = await sessionService.getLatestSession();
      const sessions = await sessionService.getAllSessions();
      const sNotes = await noteService.getSentenceNotes();
      const wNotes = await noteService.getWritingNotes();
      
      setWords(allWords || []);
      setReviewWords(toReview || []);
      setSession(latestSession);
      setAllSessions(sessions || []);
      setSentenceNotes(sNotes || []);
      setWritingNotes(wNotes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReview(false);
    }
  };

  const toggleTranslation = (id: string) => {
    setVisibleTranslations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setIsAnalyzing(true);
    try {
      const wordList = importText.split('\n').map(w => w.trim()).filter(w => w);
      const analyzed = await analyzeWords(wordList);
      const added = await wordService.addWords(analyzed);
      
      const { story, storyTranslation, podcastScript, podcastTheme } = await generateStoryAndPodcast(added as Word[]);
      
      const newSession: Partial<LearningSession> = {
        date: format(new Date(), 'yyyy-MM-dd'),
        wordIds: added.map(w => w.id!),
        story,
        storyTranslation,
        podcastScript,
        podcastTheme
      };
      await sessionService.saveSession(newSession);
      
      setImportText('');
      fetchData();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FF5C00', '#00E0FF', '#1A1A1A'] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReview = async (quality: number) => {
    const currentWord = reviewWords[currentReviewIndex];
    if (!currentWord) return;
    
    // Track word for session podcast
    setReviewedWordsInSession(prev => [...prev, currentWord.text]);
    
    await wordService.updateWordReview(currentWord.id!, quality);
    
    if (currentReviewIndex < reviewWords.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
      setShowReviewAnswer(false);
    } else {
      const finalWords = [...reviewedWordsInSession, currentWord.text];
      setReviewWords([]);
      setCurrentReviewIndex(0);
      fetchData();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FF5C00', '#00E0FF'] });
      
      // Generate Review Podcast
      setIsGeneratingReviewPodcast(true);
      try {
        const { podcastScript, podcastTheme } = await generateReviewPodcast(finalWords);
        setReviewPodcast(podcastScript);
        setReviewPodcastTheme(podcastTheme);
        
        // Save for persistence today
        localStorage.setItem('wordflourish_daily_podcast', JSON.stringify({
          script: podcastScript,
          theme: podcastTheme,
          date: new Date().toDateString()
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingReviewPodcast(false);
      }
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Header */}
      <header className="border-b-[4px] sm:border-b-[6px] border-brand-black bg-gradient-to-r from-candy-mint via-candy-sky to-candy-lavender p-3 sm:p-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 group cursor-pointer">
            <div className="bg-brand-black p-1.5 sm:p-3 rotate-[-6deg] group-hover:rotate-[6deg] transition-transform animate-float rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
              <Flower2 className="w-5 h-5 sm:w-10 sm:h-10 text-candy-yellow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-4xl uppercase tracking-tighter font-black text-brand-black drop-shadow-[1px_1px_0px_rgba(255,255,255,1)] sm:drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">Word Flourish</h1>
              <div className="flex gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-candy-pink" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-candy-yellow" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-candy-mint" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-8">
            <div className="text-right hidden sm:block">
              <div className="text-[8px] sm:text-sm font-black uppercase text-brand-black/60 tracking-widest">Growth</div>
              <div className="text-base sm:text-3xl font-black leading-none text-brand-black">{words.filter(w => w.status === 'mastered').length}</div>
            </div>
            <div className="bg-brand-black w-10 h-10 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border-[3px] sm:border-[4px] border-white flex items-center justify-center overflow-hidden animate-wiggle shadow-lg">
              <Smile className="w-6 h-6 sm:w-10 sm:h-10 text-candy-pink" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 mt-4 sm:mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' && (
            <motion.div 
              key="learn"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl flex items-center gap-2 font-black">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-brand-accent" /> <span className="doodle-underline">New Words</span>
                  </h2>
                  <TypewriterInput 
                    value={importText}
                    onChange={setImportText}
                    onImport={handleImport}
                    isAnalyzing={isAnalyzing}
                  />
                </div>

                <div className="hidden lg:block">
                  <IllustrationBox />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                {session ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl sm:text-4xl uppercase tracking-tighter doodle-underline">Today's List</h2>
                      <Badge variant="accent">{session.date}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {words.filter(w => session.wordIds.includes(w.id!)).map(word => (
                        <Card key={word.id} className="group hover:rotate-1 transition-transform">
                        <div className="flex flex-col gap-2 mb-6">
                          <h3 className="text-3xl sm:text-4xl text-brand-accent break-all leading-tight font-black">{word.text}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="text-[10px] sm:text-xs bg-brand-accent/10 text-brand-accent border-brand-accent/20 font-bold">{word.pronunciation}</Badge>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold">{word.level}</Badge>
                          </div>
                        </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs font-black uppercase text-brand-accent mb-1">Meaning</div>
                                <p className="font-black text-lg sm:text-xl">{word.meaning}</p>
                              </div>
                              
                              <div>
                                <div className="text-xs font-black uppercase text-brand-accent mb-1">Usage</div>
                                <p className="text-sm font-bold leading-relaxed">{word.usage}</p>
                              </div>

                              <div>
                                <div className="text-xs font-black uppercase text-brand-accent mb-1">Etymology & Roots</div>
                                <p className="text-sm opacity-80 leading-relaxed">{word.etymology}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div 
                                className="group/example p-6 bg-[#FDFCF8] border-2 border-brand-black relative cursor-pointer hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 rounded-xl"
                                onClick={() => word.id && toggleTranslation(word.id)}
                              >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-accent" />
                                <div className="flex items-center gap-2 mb-3">
                                  <PenTool className="w-3 h-3 text-brand-accent" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">In Context</span>
                                </div>
                                <p className="text-base sm:text-xl font-serif font-bold italic leading-relaxed text-brand-black">
                                  "{word.example}"
                                </p>
                                
                                <AnimatePresence mode="wait">
                                  {word.id && visibleTranslations.includes(word.id) && word.exampleTranslation && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-4 pt-4 border-t-2 border-brand-black/10">
                                        <p className="text-sm sm:text-base font-black text-brand-accent/90 leading-relaxed">
                                          {word.exampleTranslation}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-brand-secondary/10 border-brand-secondary">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Sparkles className="w-20 h-20" />
                      </div>
                      <h3 className="text-xl sm:text-2xl mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> Context Story
                      </h3>
                      <div className="prose prose-sm sm:prose-lg max-w-none font-medium mb-6">
                        <Markdown>{session.story}</Markdown>
                      </div>
                      {session.storyTranslation && (
                        <div className="text-sm sm:text-base font-bold text-brand-accent border-t-2 border-brand-black/10 pt-4">
                          <Markdown>{session.storyTranslation}</Markdown>
                        </div>
                      )}
                    </Card>

                    <Card className="bg-brand-black text-white overflow-hidden border-4 border-brand-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                      <div className="p-4 sm:p-6 border-b-4 border-brand-black bg-zinc-900">
                        <h3 className="text-xl sm:text-2xl flex items-center gap-2 text-brand-secondary uppercase tracking-tighter font-black">
                          <Volume2 className="w-6 h-6" /> {session.podcastTheme || "podcast script"}
                        </h3>
                      </div>
                      
                      <div className="p-4 sm:p-6 space-y-8">
                        <PodcastPlayer script={session.podcastScript} title={session.podcastTheme || "Today's Podcast"} />

                        <div className="space-y-6">
                          <AnimatePresence>
                            {isScriptVisible && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-zinc-900/80 p-5 sm:p-10 rounded-2xl border-2 border-white/5 shadow-2xl prose prose-invert max-w-none prose-p:mb-4 sm:prose-p:mb-6 last:prose-p:mb-0 font-mono text-xs sm:text-sm leading-relaxed text-white">
                                  <Markdown>{session.podcastScript}</Markdown>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex justify-center">
                            <button 
                              onClick={() => setIsScriptVisible(!isScriptVisible)}
                              className={cn(
                                "group relative overflow-hidden px-8 sm:px-10 py-3 sm:py-4 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs transition-all rounded-full border-2",
                                isScriptVisible 
                                  ? "bg-zinc-800 text-white border-white/10 hover:bg-zinc-700" 
                                  : "bg-brand-secondary text-brand-black border-brand-black shadow-[0_4px_12px_rgba(0,224,255,0.2)] sm:shadow-[0_8px_20px_rgba(0,224,255,0.3)] hover:shadow-[0_12px_24px_rgba(0,224,255,0.4)] hover:-translate-y-1 active:translate-y-0"
                              )}
                            >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                              <span className="relative flex items-center gap-2 sm:gap-3">
                                {isScriptVisible ? (
                                  <>
                                    <EyeOff className="w-4 h-4" /> Hide Transcript
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 animate-spin-slow" /> Reveal Transcript
                                  </>
                                )}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="pt-8 pb-12">
                      <Button 
                        onClick={() => setActiveTab('review')} 
                        className="w-full py-6 text-xl bg-brand-accent text-white group"
                      >
                        <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        Start Review Now
                      </Button>
                      <p className="text-center text-xs font-bold opacity-40 mt-4 uppercase tracking-widest">
                        Reinforce these words using Ebbinghaus Spaced Repetition
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 border-4 border-brand-muted rounded-3xl">
                    <History className="w-16 h-16 text-brand-muted mb-4" />
                    <p className="text-brand-muted font-black text-xl uppercase">No session today yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div 
              key="review"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto"
            >
              {isLoadingReview && reviewWords.length === 0 ? (
                <div className="text-center py-32">
                  <RefreshCw className="w-12 h-12 animate-spin mx-auto text-brand-accent mb-4" />
                  <p className="text-xl font-black uppercase">Loading Reviews...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {reviewWords.length > 0 && reviewWords[currentReviewIndex] ? (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl uppercase">Review Mode</h2>
                        <div className="text-xl font-black">{currentReviewIndex + 1} / {reviewWords.length}</div>
                      </div>
                      
                      <div className="h-6 bg-brand-muted border-4 border-brand-black overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentReviewIndex + 1) / reviewWords.length) * 100}%` }}
                          className="h-full bg-brand-secondary border-r-4 border-brand-black"
                        />
                      </div>

                      <Card 
                        key={reviewWords[currentReviewIndex]?.id || currentReviewIndex}
                        className={cn(
                          "min-h-[350px] sm:min-h-[450px] flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden transition-all duration-300",
                          showReviewAnswer ? "bg-white text-black" : "bg-[#1A1A1A] text-white"
                        )} 
                        onClick={() => setShowReviewAnswer(true)}
                      >
                        {!showReviewAnswer ? (
                          <div className="flex items-center justify-center w-full h-full p-4 sm:p-8">
                            <h3 className="text-4xl sm:text-8xl uppercase tracking-tighter font-black text-brand-accent select-none break-words max-w-full">
                              {reviewWords[currentReviewIndex]?.text}
                            </h3>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4 sm:space-y-8 p-4">
                            <div>
                              <h3 className="text-3xl sm:text-5xl uppercase mb-1 sm:mb-2 text-brand-accent break-words">{reviewWords[currentReviewIndex].text}</h3>
                              <Badge variant="accent">{reviewWords[currentReviewIndex].pronunciation}</Badge>
                            </div>
                            <div className="text-xl sm:text-3xl font-black">{reviewWords[currentReviewIndex].meaning}</div>
                            <div className="p-4 sm:p-6 bg-brand-muted/50 border-2 sm:border-4 border-brand-black text-base sm:text-lg italic text-brand-black">
                              "{reviewWords[currentReviewIndex].example}"
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4">
                              <Button variant="outline" onClick={(e: any) => { e.stopPropagation(); handleReview(1); }} className="text-xs sm:text-sm py-2 sm:py-4">感到陌生</Button>
                              <Button variant="secondary" onClick={(e: any) => { e.stopPropagation(); handleReview(3); }} className="text-xs sm:text-sm py-2 sm:py-4">记忆模糊</Button>
                              <Button variant="primary" onClick={(e: any) => { e.stopPropagation(); handleReview(5); }} className="text-xs sm:text-sm py-2 sm:py-4">完全记住</Button>
                            </div>
                          </motion.div>
                        )}
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-20 space-y-8">
                      {isGeneratingReviewPodcast ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="bg-brand-muted inline-block p-6 border-4 border-brand-black rotate-[5deg]">
                            <Sparkles className="w-20 h-20" />
                          </div>
                          <h2 className="text-3xl uppercase">Generating Review Podcast...</h2>
                          <p className="font-bold">Synthesizing your reviewed words into a story.</p>
                        </div>
                      ) : reviewPodcast ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                          <div className="bg-brand-secondary inline-block p-6 border-4 border-brand-black rotate-[5deg]">
                            <Award className="w-20 h-20" />
                          </div>
                          <h2 className="text-4xl uppercase">Review Complete!</h2>
                          
                          <Card className="bg-brand-black text-white text-left overflow-hidden border-4 border-brand-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <div className="p-4 sm:p-6 border-b-4 border-brand-black bg-zinc-900">
                              <h3 className="text-2xl flex items-center gap-2 text-brand-secondary font-black uppercase tracking-tighter">
                                <Volume2 className="w-6 h-6" /> Review Podcast
                              </h3>
                            </div>

                            <div className="p-4 sm:p-6 space-y-10">
                              <PodcastPlayer script={reviewPodcast} title={reviewPodcastTheme || "Weekly Review Podcast"} />

                              <div className="space-y-6">
                                <AnimatePresence>
                                  {isScriptVisible && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="bg-zinc-900/80 p-5 sm:p-10 rounded-2xl border-2 border-white/5 shadow-2xl prose prose-invert max-w-none prose-p:mb-4 sm:prose-p:mb-6 last:prose-p:mb-0 font-mono text-xs sm:text-sm leading-relaxed text-white">
                                        <Markdown>{reviewPodcast}</Markdown>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="flex justify-center">
                                  <button 
                                    onClick={() => setIsScriptVisible(!isScriptVisible)}
                                    className={cn(
                                      "group relative overflow-hidden px-8 sm:px-10 py-3 sm:py-4 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs transition-all rounded-full border-2",
                                      isScriptVisible 
                                        ? "bg-zinc-800 text-white border-white/10 hover:bg-zinc-700" 
                                        : "bg-brand-secondary text-brand-black border-brand-black shadow-[0_4px_12px_rgba(0,224,255,0.2)] sm:shadow-[0_8px_20px_rgba(0,224,255,0.3)] hover:shadow-[0_12px_24px_rgba(0,224,255,0.4)] hover:-translate-y-1 active:translate-y-0"
                                    )}
                                  >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative flex items-center gap-2 sm:gap-3">
                                      {isScriptVisible ? (
                                        <>
                                          <EyeOff className="w-4 h-4" /> Hide Transcript
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-4 h-4 animate-spin-slow" /> Reveal Transcript
                                        </>
                                      )}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          <Button onClick={() => setActiveTab('learn')} variant="primary" className="w-full">
                            Back to Learning
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="space-y-8">
                          <div className="bg-brand-secondary inline-block p-6 border-4 border-brand-black rotate-[5deg]">
                            <Star className="w-20 h-20" />
                          </div>
                          <h2 className="text-5xl uppercase">All Clear!</h2>
                          <p className="text-xl font-bold">You've finished all reviews for today.</p>
                          <Button onClick={() => setActiveTab('learn')} variant="primary" className="w-full">
                            Learn More Words
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Large Module Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-4 border-brand-black">
                    <Card 
                      onClick={() => setActiveTab('review-depot')}
                      className="group cursor-pointer hover:bg-brand-accent/5 transition-colors border-brand-accent"
                    >
                      <div className="flex items-center gap-6">
                        <div className="bg-brand-accent p-6 border-4 border-brand-black group-hover:rotate-12 transition-transform">
                          <Library className="w-12 h-12 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl uppercase font-black tracking-tighter">Word Depot</h3>
                          <p className="font-bold opacity-60">Explore your learned vocabulary by levels.</p>
                        </div>
                      </div>
                    </Card>

                    <Card 
                      onClick={() => setActiveTab('review-analysis')}
                      className="group cursor-pointer hover:bg-brand-secondary/5 transition-colors border-brand-secondary"
                    >
                      <div className="flex items-center gap-6">
                        <div className="bg-brand-secondary p-6 border-4 border-brand-black group-hover:rotate-12 transition-transform">
                          <Sparkles className="w-12 h-12 text-brand-black" />
                        </div>
                        <div>
                          <h3 className="text-3xl uppercase font-black tracking-tighter">Word Analysis</h3>
                          <p className="font-bold opacity-60">Discover synonyms, antonyms, and usage patterns.</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'review-depot' && (
            <WordDepotView 
              words={words} 
              onBack={() => setActiveTab('review')} 
              onDelete={async (id) => {
                await wordService.deleteWord(id);
                fetchData();
              }}
            />
          )}

          {activeTab === 'review-analysis' && (
            <WordAnalysisView words={words} onBack={() => setActiveTab('review')} />
          )}

          {activeTab === 'practice' && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10"
            >
              <PracticeCard 
                title="Sentence Lab" 
                desc="Master word usage with real-time AI feedback." 
                icon={<PenTool />} 
                onClick={() => setActiveTab('practice-sentence')}
                color="bg-brand-accent"
                badge="Popular"
              />
              <PracticeCard 
                title="Essay Forge" 
                desc="Build long-form writing skills with deep analysis." 
                icon={<Award />} 
                onClick={() => setActiveTab('practice-writing')}
                color="bg-brand-secondary"
                badge="Advanced"
              />
              <PracticeCard 
                title="Cloze Test" 
                desc="Contextual gap-fill challenges for vocabulary." 
                icon={<RefreshCw />} 
                onClick={() => setActiveTab('practice-cloze')}
                color="bg-candy-mint"
                badge="Fun"
              />
              <PracticeCard 
                title="Archive" 
                desc="Review your past practice notes and progress." 
                icon={<History />} 
                onClick={() => setActiveTab('notes')}
                color="bg-candy-yellow"
                badge="History"
              />
            </motion.div>
          )}

          {activeTab === 'practice-sentence' && (
            <SentencePracticeView 
              words={words} 
              onBack={() => setActiveTab('practice')} 
            />
          )}

          {activeTab === 'practice-writing' && (
            <WritingPracticeView 
              words={words} 
              onBack={() => setActiveTab('practice')} 
            />
          )}

          {activeTab === 'practice-cloze' && (
            <ClozePracticeView words={words} onBack={() => setActiveTab('practice')} />
          )}

          {activeTab === 'notes' && (
            <NotesView onBack={() => setActiveTab('practice')} />
          )}

          {activeTab === 'achievement' && (
            <AchievementView 
              words={words} 
              sessions={allSessions} 
              sentenceNotes={sentenceNotes} 
              writingNotes={writingNotes} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-brand-black border-[2px] sm:border-[3px] border-white p-1 sm:p-2 rounded-full flex items-center gap-0.5 sm:gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-50 max-w-[98vw] sm:max-w-[95vw]">
        <NavButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<BookOpen />} label="Learn" />
        <NavButton active={activeTab === 'review'} onClick={() => setActiveTab('review')} icon={<RefreshCw />} label="Review" count={reviewWords.length} />
        <NavButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} icon={<PenTool />} label="Practice" />
        <NavButton active={activeTab === 'achievement'} onClick={() => setActiveTab('achievement')} icon={<Award />} label="Stats" />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full transition-all",
      active ? "bg-brand-accent text-white" : "text-brand-muted hover:text-white"
    )}
  >
    <div className="relative">
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand-secondary text-brand-black text-[8px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-brand-black">
          {count}
        </span>
      )}
    </div>
    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden md:block">{label}</span>
  </button>
);

const PracticeCard = ({ title, desc, icon, onClick, color, badge }: any) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "group cursor-pointer relative overflow-hidden rounded-3xl border-[4px] border-brand-black p-6 sm:p-8 transition-all",
      "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
      color
    )}
  >
    {/* Background Pattern - Only visible on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
    
    {/* Badge */}
    {badge && (
      <div className="absolute top-4 right-4 bg-brand-black text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest rotate-3 group-hover:rotate-0 transition-transform">
        {badge}
      </div>
    )}

    <div className="relative z-10">
      <div className="bg-brand-black text-white w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mb-6 sm:mb-8 border-[4px] border-white rounded-2xl rotate-[-6deg] group-hover:rotate-6 transition-all duration-500 shadow-xl">
        {React.cloneElement(icon, { className: 'w-7 h-7 sm:w-10 sm:h-10' })}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl sm:text-4xl uppercase leading-none flex items-center gap-2">
          {title}
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </h3>
        <p className="text-sm sm:text-lg font-bold opacity-80 leading-tight max-w-[80%]">
          {desc}
        </p>
      </div>
    </div>

    {/* Decorative element */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
  </motion.div>
);

const IllustrationBox = () => (
  <div className="relative h-48 sm:h-64 w-full bg-candy-yellow border-[4px] border-brand-black overflow-hidden rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
    <div className="absolute top-4 left-4 bg-candy-pink w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-brand-black rounded-full animate-float" />
    <div className="absolute bottom-4 right-4 bg-candy-sky w-16 h-16 sm:w-24 sm:h-24 border-[3px] border-brand-black rotate-12 animate-wiggle rounded-2xl" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Smile className="w-24 h-24 sm:w-32 sm:h-32 text-brand-black opacity-10" />
    </div>
    <div className="absolute top-8 right-8 w-12 sm:w-16 h-3 sm:h-4 bg-brand-black rotate-[-45deg] rounded-full" />
    <div className="absolute bottom-10 left-10 w-6 h-6 sm:w-8 sm:h-8 border-[3px] border-brand-black rotate-45 bg-candy-lavender rounded-lg" />
    <div className="absolute top-1/2 right-4 w-4 h-4 sm:w-6 sm:h-6 bg-white border-2 border-brand-black rounded-full" />
  </div>
);

const FlowerVisualization = ({ masteredCount }: { masteredCount: number }) => {
  const flowerCount = Math.floor(masteredCount / 100);
  const currentProgress = masteredCount % 100;
  
  const getStage = (progress: number) => {
    if (progress >= 80) return 'bloom';
    if (progress >= 50) return 'bud';
    if (progress >= 20) return 'sprout';
    return 'seed';
  };

  const currentStage = getStage(currentProgress);
  
  const flowerTypes = [
    { name: 'Tulip', color: '#FF8AAE', petalShape: 'rounded-[50%_50%_10%_10%]' },
    { name: 'Sunflower', color: '#FFD93D', petalShape: 'rounded-full' },
    { name: 'Rose', color: '#FF5D5D', petalShape: 'rounded-t-full' },
    { name: 'Lavender', color: '#C084FC', petalShape: 'rounded-full' },
    { name: 'Daisy', color: '#FFFFFF', petalShape: 'rounded-full' },
  ];

  const renderFlower = (stage: string, index: number, isGrowing: boolean = false) => {
    const type = flowerTypes[index % flowerTypes.length];
    
    return (
      <motion.div
        key={index}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center relative"
        style={{ margin: '0 10px' }}
      >
        {stage === 'seed' && (
          <div className="relative">
            <div className="w-8 h-8 bg-[#5D4037] rounded-full border-[2px] border-brand-black shadow-lg" />
          </div>
        )}
        {stage === 'sprout' && (
          <div className="flex flex-col items-center">
            <div className="w-2 h-16 bg-[#4E9F3D] border-[2px] border-brand-black rounded-full" />
            <div className="flex gap-0 -mt-10">
              <div className="w-10 h-6 bg-[#91C788] border-[2px] border-brand-black rounded-[20px_0_20px_0] origin-right" />
              <div className="w-10 h-6 bg-[#91C788] border-[2px] border-brand-black rounded-[0_20px_0_20px] origin-left" />
            </div>
          </div>
        )}
        {stage === 'bud' && (
          <div className="flex flex-col items-center">
            <div className="w-3 h-24 bg-[#4E9F3D] border-[2px] border-brand-black rounded-full" />
            <div className="w-12 h-16 bg-white border-[2px] border-brand-black rounded-full -mt-32 flex items-center justify-center overflow-hidden">
               <div className="w-full h-full" style={{ backgroundColor: type.color, opacity: 0.6 }} />
            </div>
            <div className="flex gap-2 -mt-16">
              <div className="w-12 h-8 bg-[#91C788] border-[2px] border-brand-black rounded-[30px_0_30px_0]" />
              <div className="w-12 h-8 bg-[#91C788] border-[2px] border-brand-black rounded-[0_30px_0_30px]" />
            </div>
          </div>
        )}
        {stage === 'bloom' && (
          <div className="flex flex-col items-center">
            <div className="w-3 h-32 bg-[#4E9F3D] border-[2px] border-brand-black rounded-full" />
            <div className="relative -mt-48 w-32 h-32 flex items-center justify-center">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <motion.div
                  key={deg}
                  animate={{ scale: [1, 1.05, 1], rotate: [deg, deg + 3, deg] }}
                  transition={{ duration: 4, repeat: Infinity, delay: deg/360 }}
                  className={cn("absolute w-16 h-16 border-[2px] border-brand-black shadow-sm", type.petalShape)}
                  style={{
                    backgroundColor: type.color,
                    transform: `rotate(${deg}deg) translateY(-25px)`,
                    transformOrigin: 'center center',
                  }}
                />
              ))}
              <div className="absolute w-14 h-14 bg-[#FFD93D] border-[2px] border-brand-black rounded-full z-20 flex items-center justify-center shadow-md">
                <Smile className="w-8 h-8 text-brand-black/70" />
              </div>
            </div>
            <div className="flex gap-8 -mt-16">
              <div className="w-16 h-10 bg-[#91C788] border-[2px] border-brand-black rounded-[40px_0_40px_0]" />
              <div className="w-16 h-10 bg-[#91C788] border-[2px] border-brand-black rounded-[0_40px_0_40px]" />
            </div>
          </div>
        )}
        {isGrowing && (
          <div className="absolute -top-8 bg-white/80 px-2 py-0.5 rounded-full border border-brand-black text-[8px] font-black uppercase whitespace-nowrap">
            Growing...
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-end p-8 bg-gradient-to-b from-[#A0E9FF] to-[#E1F7FF] border-[4px] border-brand-black rounded-3xl relative overflow-hidden h-full min-h-[400px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Natural Sky Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/40 rounded-full blur-xl" />
      <motion.div 
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 right-10 flex gap-2"
      >
        <div className="w-12 h-6 bg-white rounded-full" />
        <div className="w-8 h-4 bg-white rounded-full -mt-2" />
      </motion.div>
      
      {/* Healing Nature Elements */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute text-xl pointer-events-none"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 20}%`,
            opacity: 0.4
          }}
        >
          {['🦋', '☁️', '✨', '🍃'][i]}
        </motion.div>
      ))}

      {/* Organic Ground */}
      <div className="absolute bottom-0 left-[-20%] right-[-20%] h-40 bg-[#91C788] border-t-[4px] border-brand-black z-0 rounded-t-[100%] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-12 bg-[#765D48] rounded-[100%] opacity-40 blur-sm" />
      </div>

      {/* Flowers Container */}
      <div className="relative z-10 flex flex-wrap items-end justify-center w-full gap-4 pb-10">
        {/* Full Bloom Flowers */}
        {[...Array(flowerCount)].map((_, i) => renderFlower('bloom', i))}
        
        {/* The Growing Flower */}
        {renderFlower(currentStage, flowerCount, true)}
      </div>

      {/* Title Label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gradient-to-r from-candy-mint/90 to-candy-sky/90 backdrop-blur-md text-brand-black px-8 py-3 rounded-[30px] font-black uppercase tracking-[0.2em] text-sm border-[3px] border-brand-black shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
        <Leaf className="w-5 h-5 text-[#4E9F3D]" />
        Learning Garden
        <Leaf className="w-5 h-5 text-[#4E9F3D] scale-x-[-1]" />
      </div>

      {/* Status Text Box */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm border-[2px] border-brand-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[220px] text-center">
        <p className="text-[11px] font-bold tracking-tight text-brand-black">
          🌻 {masteredCount} Mastered • {flowerCount} Flowers Bloomed
        </p>
      </div>
    </div>
  );
};

const CalendarStreak = ({ sessions }: { sessions: LearningSession[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });

  const activeDates = sessions.map(s => s.date);
  
  const calculateStreak = (sessions: LearningSession[]) => {
    if (sessions.length === 0) return 0;
    const dates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
    let streak = 0;
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const expected = subDays(new Date(dates[0]), i);
      if (isSameDay(d, expected)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(sessions);

  const nextMonth = () => setCurrentMonth(prev => startOfMonth(new Date(new Date(prev).setMonth(prev.getMonth() + 1))));
  const prevMonth = () => setCurrentMonth(prev => startOfMonth(new Date(new Date(prev).setMonth(prev.getMonth() - 1))));

  const getMonthInsight = () => {
    const monthActiveDays = calendarDays.filter(day => 
      day.getMonth() === currentMonth.getMonth() && activeDates.includes(format(day, 'yyyy-MM-dd'))
    ).length;
    
    const totalDaysInMonth = monthEnd.getDate();
    const ratio = monthActiveDays / totalDaysInMonth;

    if (ratio > 0.8) return { text: "You're on fire! This month is legendary. 🔥", color: "text-green-600" };
    if (ratio > 0.5) return { text: "Great consistency! Keep pushing forward. ✨", color: "text-blue-600" };
    if (ratio > 0.2) return { text: "You've started, but there's room for more! 🚀", color: "text-yellow-600" };
    if (ratio > 0) return { text: "Don't let your streak die! Come back today. ⚠️", color: "text-orange-600" };
    return { text: "A fresh start awaits you! Start your streak today. 🌱", color: "text-gray-500" };
  };

  const insight = getMonthInsight();

  return (
    <div className="bg-[#FFD93D] border-[4px] border-brand-black p-6 rounded-3xl h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase flex items-center gap-2 text-brand-black">
          <Calendar className="w-5 h-5" /> Learning Streak
        </h3>
        <div className="bg-[#FF6B6B] text-white px-4 py-1 rounded-full border-2 border-brand-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {streak} Days
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={prevMonth} className="p-1 hover:bg-black/5 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-brand-black" />
        </button>
        <span className="font-black text-brand-black uppercase tracking-wider">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-black/5 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-brand-black" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[8px] sm:text-[10px] font-black opacity-60 text-brand-black">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isActive = activeDates.includes(dateStr);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all",
                isActive ? "bg-[#4D96FF] border-brand-black text-white scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white/40 border-brand-black/10 text-brand-black/40",
                isToday && "border-brand-black ring-2 ring-[#FF6B6B] bg-white",
                !isCurrentMonth && "opacity-20"
              )}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-auto bg-white/50 border-2 border-brand-black p-3 rounded-2xl">
        <p className={cn("text-xs font-black text-center italic", insight.color)}>
          {insight.text}
        </p>
      </div>
    </div>
  );
};

const AchievementView = ({ words, sessions, sentenceNotes, writingNotes }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showDailyWin, setShowDailyWin] = useState(false);

  const masteredCount = words.filter((w: Word) => w.status === 'mastered').length;
  const learningCount = words.filter((w: Word) => w.status === 'learning').length;
  const todayWords = words.filter((w: Word) => format(new Date(w.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));

  const getExpressionLevel = () => {
    const totalNotes = sentenceNotes.length + writingNotes.length;
    if (totalNotes > 50) return { title: 'Master Storyteller', level: 5 };
    if (totalNotes > 20) return { title: 'Fluent Essayist', level: 4 };
    if (totalNotes > 10) return { title: 'Creative Writer', level: 3 };
    if (totalNotes > 5) return { title: 'Sentence Builder', level: 2 };
    return { title: 'Novice Speaker', level: 1 };
  };

  const expression = getExpressionLevel();

  const calculateStreak = (sessions: LearningSession[]) => {
    if (sessions.length === 0) return 0;
    const dates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
    let streak = 0;
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const expected = subDays(new Date(dates[0]), i);
      if (isSameDay(d, expected)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(sessions);

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (words.length === 0) return;
      setIsEvaluating(true);
      try {
        const result = await generateStatsEvaluation({
          masteredCount,
          learningCount,
          streak,
          expressionLevel: expression.title,
          totalNotes: sentenceNotes.length + writingNotes.length
        });
        setEvaluation(result);
      } catch (e) {
        console.error("Failed to fetch evaluation", e);
      } finally {
        setIsEvaluating(false);
      }
    };

    fetchEvaluation();
  }, [words.length, sessions.length, sentenceNotes.length, writingNotes.length]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#FDFCF8',
      logging: false,
      useCORS: true
    });
    const link = document.createElement('a');
    link.download = `WordFlourish-Achievement-${format(new Date(), 'MMdd')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-16 pb-12">
      <div className="flex justify-center py-8">
        <BellButton 
          onClick={() => setShowDailyWin(!showDailyWin)} 
          isActive={showDailyWin}
        />
      </div>

      {showDailyWin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-6 bg-candy-mint/10 p-8 rounded-[40px] border-[4px] border-brand-black relative"
        >
          <div 
            ref={cardRef}
            className="w-full max-w-md bg-white border-[4px] sm:border-[6px] border-brand-black p-4 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden rounded-2xl sm:rounded-3xl"
          >
            {/* Doodle Accents */}
            <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-candy-pink/20 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-12 sm:w-24 h-12 sm:h-24 bg-candy-sky/20 rounded-tr-full" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-5xl uppercase leading-none mb-1 sm:mb-2 font-black">Daily<br/>Win</h2>
                  <div className="text-base sm:text-xl font-black text-candy-pink">{format(new Date(), 'yyyy.MM.dd')}</div>
                </div>
                <div className="bg-brand-black p-2 sm:p-4 rotate-[10deg] rounded-xl sm:rounded-2xl">
                  <Award className="text-candy-yellow w-6 h-6 sm:w-12 sm:h-12" />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-8">
                <div className="border-[3px] sm:border-[4px] border-brand-black p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-[8px] sm:text-sm font-black uppercase mb-2 sm:mb-4 text-candy-pink">Today's Vocabulary</div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {todayWords.length > 0 ? todayWords.map((w: Word) => (
                      <span key={w.id} className="text-[10px] sm:text-lg font-black uppercase bg-candy-mint/30 px-1.5 sm:px-4 py-0.5 sm:py-1 border sm:border-2 border-brand-black rounded sm:rounded-lg">{w.text}</span>
                    )) : <span className="text-brand-black/40 font-black text-xs">No words today</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="border-[3px] sm:border-[4px] border-brand-black p-3 sm:p-6 bg-candy-yellow text-center rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-2xl sm:text-5xl font-black">{masteredCount}</div>
                    <div className="text-[8px] sm:text-xs font-black uppercase">Mastered</div>
                  </div>
                  <div className="border-[3px] sm:border-[4px] border-brand-black p-3 sm:p-6 bg-candy-pink text-brand-black text-center rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-2xl sm:text-5xl font-black">{todayWords.length}</div>
                    <div className="text-[8px] sm:text-xs font-black uppercase">Today</div>
                  </div>
                </div>

                <div className="bg-brand-black p-4 sm:p-8 text-white rotate-[-2deg] rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-[8px] sm:text-xs font-black uppercase mb-2 sm:mb-4 text-candy-sky">Expression Skill</div>
                  <p className="text-base sm:text-2xl font-black italic leading-tight uppercase">
                    {expression.title}
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t-[3px] sm:border-t-[4px] border-brand-black flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-candy-lavender border-2 sm:border-[3px] border-brand-black flex items-center justify-center rounded-xl sm:rounded-2xl">
                  <Smile className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <div className="text-sm sm:text-xl font-black uppercase">Word Flourish User</div>
                  <div className="text-[8px] sm:text-xs font-bold opacity-60 uppercase tracking-widest leading-tight">Streak: {streak} Days • Keep Blooming</div>
                </div>
              </div>
            </div>
          </div>
          
          <Button onClick={() => { downloadCard(); }} className="bg-brand-black text-white px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
            <Download className="w-5 h-5" /> Download Achievement
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FlowerVisualization masteredCount={masteredCount} />
        <CalendarStreak sessions={sessions} />
      </div>

      {/* AI Evaluation Section */}
      <Card className="bg-white border-[4px] border-brand-black p-8 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-candy-yellow/20 rounded-bl-full -z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-black p-2 rotate-[-5deg] rounded-lg">
              <Sparkles className="w-6 h-6 text-candy-yellow" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-black">AI Learning Report</h3>
          </div>

          {isEvaluating ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-brand-muted rounded w-3/4" />
              <div className="h-4 bg-brand-muted rounded w-1/2" />
              <div className="h-4 bg-brand-muted rounded w-5/6" />
            </div>
          ) : evaluation ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-black uppercase text-[#FF6B6B] mb-2">Current Assessment</div>
                <p className="text-lg font-bold leading-relaxed text-brand-black">{evaluation.evaluation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#6BCB77]/10 p-4 border-2 border-brand-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-xs font-black uppercase text-brand-black/60 mb-2">What You Can Do</div>
                  <p className="text-sm font-bold text-brand-black">{evaluation.capabilities}</p>
                </div>
                <div className="bg-[#4D96FF]/10 p-4 border-2 border-brand-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-xs font-black uppercase text-brand-black/60 mb-2">Areas to Improve</div>
                  <p className="text-sm font-bold text-brand-black">{evaluation.weaknesses}</p>
                </div>
              </div>

              <div className="bg-brand-black p-6 rounded-2xl relative overflow-hidden group shadow-[6px_6px_0px_0px_rgba(255,113,206,1)]">
                <div className="absolute inset-0 bg-[#FF71CE] opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-center space-y-4">
                  {evaluation.encouragement.replace(/["']/g, '').split('/').map((text: string, i: number) => (
                    <p key={i} className="text-xl sm:text-2xl font-black text-white italic leading-tight">
                      {text.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 opacity-50 font-bold text-brand-black">
              Complete more practices to generate your AI report.
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="bg-candy-mint/20 border-brand-black border-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black uppercase text-brand-black/60 mb-2">Words Mastered</div>
          <div className="text-4xl font-black text-brand-black">{masteredCount}</div>
          <div className="mt-2 h-3 bg-brand-black/10 rounded-full overflow-hidden border-2 border-brand-black">
            <div className="h-full bg-candy-mint" style={{ width: `${Math.min(100, (masteredCount / 100) * 100)}%` }} />
          </div>
        </Card>
        <Card className="bg-candy-sky/20 border-brand-black border-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black uppercase text-brand-black/60 mb-2">Currently Learning</div>
          <div className="text-4xl font-black text-brand-black">{learningCount}</div>
          <div className="mt-2 h-3 bg-brand-black/10 rounded-full overflow-hidden border-2 border-brand-black">
            <div className="h-full bg-candy-sky" style={{ width: `${Math.min(100, (learningCount / 50) * 100)}%` }} />
          </div>
        </Card>
        <Card className="bg-candy-lavender/20 border-brand-black border-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black uppercase text-brand-black/60 mb-2">Expression Level</div>
          <div className="text-2xl font-black uppercase text-brand-black">{expression.title}</div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn("h-3 flex-1 rounded-full border-2 border-brand-black", i <= expression.level ? "bg-candy-lavender" : "bg-white")} />
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};

const SentencePracticeView = ({ words, onBack }: any) => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [sentence, setSentence] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const loadNewWord = async () => {
    if (words.length === 0) return;
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setSentence('');
    setEvaluation(null);
    setIsGeneratingPrompt(true);
    try {
      const p = await generateSentencePrompt(word.text);
      setPrompt(p);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  useEffect(() => {
    if (words.length > 0 && !currentWord) {
      loadNewWord();
    }
  }, [words]);

  const handleEvaluate = async () => {
    if (!sentence.trim() || !currentWord) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateSentence(currentWord.text, sentence);
      setEvaluation(result);
      await noteService.saveSentenceNote({
        wordId: currentWord.id,
        wordText: currentWord.text,
        originalSentence: sentence,
        feedback: result.feedback,
        optimizedSentence: result.optimizedSentence
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-6 h-6" /> Back to Practice
      </Button>
      
      {currentWord && (
        <Card className="bg-brand-muted/20">
          <div className="text-center mb-6 sm:mb-10">
            <h3 className="text-4xl sm:text-6xl uppercase tracking-tighter mb-2 sm:mb-4 break-words">{currentWord.text}</h3>
            <Badge variant="accent">{currentWord.meaning}</Badge>
            {prompt && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white border-[3px] sm:border-4 border-brand-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-left">
                <p className="text-[10px] sm:text-xs font-black text-brand-accent uppercase mb-1 sm:mb-2">Prompt / 造句提示</p>
                <p className="text-lg sm:text-xl font-bold leading-tight">{isGeneratingPrompt ? 'Generating prompt...' : prompt}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <textarea 
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder={`Use "${currentWord.text}" in a sentence...`}
                className="brutalist-input w-full h-48 text-xl"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={loadNewWord} className="flex-1">Skip Word</Button>
              <Button onClick={handleEvaluate} disabled={isEvaluating || !sentence.trim()} className="flex-1">
                {isEvaluating ? 'Evaluating...' : 'Submit Sentence'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {evaluation && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-brand-secondary/10 border-brand-secondary">
            <h4 className="text-xl sm:text-2xl uppercase mb-3 sm:mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 sm:w-6 sm:h-6" /> AI Review
            </h4>
            <p className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 leading-relaxed">{evaluation.feedback}</p>
            <div className="bg-white p-4 sm:p-6 border-[3px] sm:border-4 border-brand-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <p className="text-[10px] sm:text-xs font-black text-brand-accent uppercase mb-1 sm:mb-2">Optimized Version</p>
              <p className="text-xl sm:text-2xl font-black leading-tight">{evaluation.optimizedSentence}</p>
            </div>
            <Button onClick={loadNewWord} className="w-full mt-8">Next Word</Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

const WritingPracticeView = ({ words, onBack }: any) => {
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [content, setContent] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const refreshWords = async () => {
    if (words.length < 5) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setSelectedWords(selected);
    setContent('');
    setEvaluation(null);
    setIsGeneratingPrompt(true);
    try {
      const p = await generateWritingPrompt(selected.map(w => w.text));
      setPrompt(p);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  useEffect(() => {
    if (words.length >= 5 && selectedWords.length === 0) {
      refreshWords();
    }
  }, [words]);

  const handleEvaluate = async () => {
    if (!content.trim() || selectedWords.length === 0) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateWriting(selectedWords.map(w => w.text), content, prompt);
      setEvaluation(result);
      await noteService.saveWritingNote({
        wordTexts: selectedWords.map(w => w.text),
        prompt,
        content,
        feedback: result.feedback,
        optimizedContent: result.optimizedContent
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-6 h-6" /> Back to Practice
      </Button>

      <Card className="bg-brand-black text-white">
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl uppercase mb-4 sm:mb-6 text-brand-secondary">Drafting Challenge</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            {selectedWords.map(w => (
              <span key={w.id} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-brand-black border-2 border-brand-secondary font-black uppercase text-xs sm:text-sm">
                {w.text}
              </span>
            ))}
          </div>
          {prompt && (
            <div className="p-3 sm:p-4 bg-brand-secondary/20 border-2 border-brand-secondary">
              <p className="text-[8px] sm:text-[10px] font-black uppercase text-brand-secondary mb-1 sm:mb-2">Writing Topic / 写作主题</p>
              <p className="text-xs sm:text-sm font-bold leading-relaxed">{isGeneratingPrompt ? 'Generating topic...' : prompt}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="relative">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your masterpiece..."
              className="brutalist-input w-full h-64 text-brand-black"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={refreshWords} className="flex-1">New Words</Button>
            <Button variant="secondary" onClick={handleEvaluate} disabled={isEvaluating || !content.trim()} className="flex-1">
              {isEvaluating ? 'Analyzing...' : 'Submit Essay'}
            </Button>
          </div>
        </div>
      </Card>

      {evaluation && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-brand-accent/10 border-brand-accent">
            <h4 className="text-xl sm:text-2xl uppercase mb-4 sm:mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" /> AI Feedback
            </h4>
            <div className="prose prose-sm sm:prose-lg max-w-none font-bold mb-6 sm:mb-8">
              <Markdown>{evaluation.feedback}</Markdown>
            </div>
            <div className="bg-white p-4 sm:p-8 border-[3px] sm:border-4 border-brand-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <p className="text-[10px] sm:text-xs font-black text-brand-secondary uppercase mb-2 sm:mb-4">Optimized Draft</p>
              <div className="prose prose-sm sm:prose-lg max-w-none font-medium">
                <Markdown>{evaluation.optimizedContent}</Markdown>
              </div>
            </div>
            <Button onClick={refreshWords} className="w-full mt-10">Start New Draft</Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

const WordDepotView = ({ words, onBack, onDelete }: { words: Word[]; onBack: () => void; onDelete: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  
  const filteredWords = words.filter(w => 
    w.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.meaning.includes(searchTerm)
  );

  const handleMouseDown = (id: string) => {
    timerRef.current = setTimeout(() => {
      setLongPressId(id);
    }, 800);
  };

  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const categorizeWords = (words: Word[]) => {
    const levels = {
      'Beginner/Common': [] as Word[],
      'Intermediate': [] as Word[],
      'Advanced/Rare': [] as Word[]
    };

    words.forEach(w => {
      const level = w.level.toLowerCase();
      if (level.includes('beginner') || level.includes('easy') || level.includes('common')) {
        levels['Beginner/Common'].push(w);
      } else if (level.includes('advanced') || level.includes('hard') || level.includes('rare')) {
        levels['Advanced/Rare'].push(w);
      } else {
        levels['Intermediate'].push(w);
      }
    });

    Object.keys(levels).forEach(key => {
      levels[key as keyof typeof levels].sort((a, b) => a.text.localeCompare(b.text));
    });

    return levels;
  };

  const levels = categorizeWords(filteredWords);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-6 h-6" /> Back to Review
      </Button>

      <div className="relative">
        <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-brand-black/40 w-5 h-5 sm:w-6 sm:h-6 z-10" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search words or meanings..."
          className="brutalist-input w-full pl-12 sm:pl-16 py-4 sm:py-6 text-lg sm:text-xl"
        />
      </div>

      {!selectedLevel ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(levels).map(([level, levelWords]) => (
            <Card 
              key={level}
              onClick={() => setSelectedLevel(level)}
              className="cursor-pointer group hover:bg-brand-accent/5 transition-all text-center p-6 sm:p-12 flex flex-col items-center justify-center gap-4 sm:gap-6"
            >
              <div className="bg-brand-muted p-4 sm:p-6 border-[3px] sm:border-4 border-brand-black group-hover:scale-110 transition-transform">
                <Library className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl uppercase font-black tracking-tighter mb-1 sm:mb-2">{level}</h3>
                <p className="font-bold text-brand-accent text-sm sm:text-base">{levelWords.length} Words</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl sm:text-4xl uppercase tracking-tighter doodle-underline truncate">{selectedLevel}</h3>
            <Button variant="outline" onClick={() => setSelectedLevel(null)} className="text-xs sm:text-sm whitespace-nowrap">Change Level</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels[selectedLevel as keyof typeof levels].map(word => (
              <Card 
                key={word.id} 
                className={cn(
                  "hover:rotate-1 transition-transform relative group",
                  longPressId === word.id && "border-red-500 bg-red-50"
                )}
                onMouseDown={() => handleMouseDown(word.id!)}
                onMouseUp={handleMouseUp}
                onTouchStart={() => handleMouseDown(word.id!)}
                onTouchEnd={handleMouseUp}
              >
                {longPressId === word.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(word.id!); setLongPressId(null); }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full z-20 hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-2xl font-black text-brand-accent">{word.text}</h4>
                  <Badge variant="secondary">{word.level}</Badge>
                </div>
                <p className="font-bold text-sm">{word.meaning}</p>
                <p className="text-xs opacity-60 mt-2 italic">"{word.example}"</p>
                {longPressId === word.id && (
                  <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />
                )}
              </Card>
            ))}
          </div>
          
          {levels[selectedLevel as keyof typeof levels].length === 0 && (
            <div className="text-center py-20 border-4 border-brand-muted rounded-3xl">
              <p className="text-brand-muted font-black text-xl uppercase">No words found in this level</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const WordAnalysisView = ({ words, onBack }: { words: Word[]; onBack: () => void }) => {
  const [analysis, setAnalysis] = useState<{ title: string; words: string[]; explanation: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [longPressIdx, setLongPressIdx] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const savedAnalysis = localStorage.getItem('wordflourish_analysis_cache');
    if (savedAnalysis) {
      setAnalysis(JSON.parse(savedAnalysis));
    } else if (words.length > 0) {
      handleGenerateAnalysis();
    }
  }, [words]);

  const handleGenerateAnalysis = async () => {
    if (words.length === 0) return;
    setIsLoading(true);
    try {
      const result = await generateWordAnalysis(words);
      setAnalysis(result);
      localStorage.setItem('wordflourish_analysis_cache', JSON.stringify(result));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = (idx: number) => {
    if (!analysis) return;
    const newAnalysis = analysis.filter((_, i) => i !== idx);
    setAnalysis(newAnalysis);
    localStorage.setItem('wordflourish_analysis_cache', JSON.stringify(newAnalysis));
    setLongPressIdx(null);
  };

  const handleMouseDown = (idx: number) => {
    timerRef.current = setTimeout(() => {
      setLongPressIdx(idx);
    }, 800);
  };

  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const filteredAnalysis = analysis?.filter(group => 
    group.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    group.words.some(w => w.toLowerCase().includes(searchTerm.toLowerCase())) ||
    group.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-6 h-6" /> Back to Review
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-4xl uppercase tracking-tighter doodle-underline">Word Analysis</h2>
        <Button 
          onClick={handleGenerateAnalysis} 
          disabled={isLoading || words.length === 0}
          variant="outline"
        >
          {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-brand-black/40 w-5 h-5 sm:w-6 sm:h-6 z-10" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search analysis groups or words..."
          className="brutalist-input w-full pl-12 sm:pl-16 py-4 sm:py-6 text-lg sm:text-xl"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-32 text-3xl uppercase font-black animate-pulse">
          Synthesizing Vocabulary Relationships...
        </div>
      ) : filteredAnalysis ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredAnalysis.map((group, idx) => (
            <Card 
              key={idx}
              onClick={() => setSelectedGroup(selectedGroup === idx ? null : idx)}
              onMouseDown={() => handleMouseDown(idx)}
              onMouseUp={handleMouseUp}
              onTouchStart={() => handleMouseDown(idx)}
              onTouchEnd={handleMouseUp}
              className={cn(
                "cursor-pointer transition-all border-brand-secondary relative",
                selectedGroup === idx ? "bg-brand-secondary/5" : "hover:bg-brand-secondary/5",
                longPressIdx === idx && "border-red-500 bg-red-50"
              )}
            >
              {longPressIdx === idx && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteGroup(idx); }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full z-20 hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-brand-secondary">{group.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.words.map(w => (
                      <Badge key={w} variant="outline" className="border-brand-secondary text-brand-secondary">{w}</Badge>
                    ))}
                  </div>
                </div>
                <ChevronRight className={cn("w-8 h-8 transition-transform", selectedGroup === idx && "rotate-90")} />
              </div>
              
              <AnimatePresence>
                {selectedGroup === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 mt-8 border-t-4 border-brand-black">
                      <div className="prose prose-lg max-w-none font-bold text-brand-black">
                        <Markdown>{group.explanation}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-4 border-brand-muted rounded-3xl">
          <Sparkles className="w-16 h-16 text-brand-muted mx-auto mb-4" />
          <p className="text-brand-muted font-black text-xl uppercase">
            {words.length > 0 ? 'Analyzing relationships between your learned words...' : 'Learn some words first!'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const ClozePracticeView = ({ words, onBack }: any) => {
  const [tests, setTests] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [mistakeAnalysis, setMistakeAnalysis] = useState<string | null>(null);
  const [isAnalyzingMistakes, setIsAnalyzingMistakes] = useState(false);

  useEffect(() => {
    if (words.length >= 3) {
      loadTests();
    }
  }, [words]);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 5);
      const result = await generateClozeTests(shuffled);
      setTests(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (option: string) => {
    const correct = option === tests[currentIndex].answer;
    setSelectedOption(option);
    setIsCorrect(correct);

    if (!correct) {
      const newMistakes = [...mistakes, {
        question: tests[currentIndex].question,
        answer: tests[currentIndex].answer,
        userAnswer: option
      }];
      setMistakes(newMistakes);

      if (newMistakes.length === 10) {
        setIsAnalyzingMistakes(true);
        try {
          const analysis = await generateMistakeAnalysis(newMistakes);
          setMistakeAnalysis(analysis);
          setMistakes([]); // Reset after analysis
        } catch (e) {
          console.error(e);
        } finally {
          setIsAnalyzingMistakes(false);
        }
      }
    }
  };

  const nextTest = () => {
    if (currentIndex < tests.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      loadTests();
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  if (isLoading) return <div className="text-center py-32 text-3xl uppercase font-black animate-pulse">Generating Challenges...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-6 h-6" /> Back to Practice
      </Button>

      {mistakeAnalysis && (
        <Card className="bg-brand-accent/10 border-brand-accent p-8 relative">
          <button 
            onClick={() => setMistakeAnalysis(null)}
            className="absolute top-4 right-4 text-brand-accent hover:scale-110 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-black uppercase mb-4 text-brand-accent">Mistake Analysis / 错题分析</h3>
          <div className="prose prose-lg max-w-none font-bold text-brand-black">
            <Markdown>{mistakeAnalysis}</Markdown>
          </div>
        </Card>
      )}

      {isAnalyzingMistakes && (
        <div className="text-center py-10 text-xl font-black animate-pulse text-brand-accent">
          Analyzing your 10 mistakes...
        </div>
      )}

      {tests.length > 0 && (
        <Card className="bg-white">
          <div className="mb-6 sm:mb-12">
            <Badge variant="secondary">Challenge {currentIndex + 1} / {tests.length}</Badge>
            <div className="text-xl sm:text-3xl font-black mt-4 sm:mt-6 leading-tight flex flex-wrap items-baseline gap-y-2">
              {tests[currentIndex].question.split(/__+/).map((part: string, i: number) => (
                <React.Fragment key={i}>
                  <span>{part}</span>
                  {i < tests[currentIndex].question.split(/__+/).length - 1 && (
                    <span className={cn(
                      "inline-block min-w-[100px] sm:min-w-[160px] border-b-4 sm:border-b-8 mx-1 sm:mx-2 text-center uppercase transition-all pb-1",
                      isCorrect === true ? "text-green-500 border-green-500" : 
                      isCorrect === false ? "text-red-500 border-red-500" : "text-brand-accent border-brand-accent"
                    )}>
                      {selectedOption || '\u00A0'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {tests[currentIndex].options.map((option: string) => (
              <button
                key={option}
                disabled={selectedOption !== null}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "p-4 sm:p-6 border-[3px] sm:border-4 border-brand-black text-lg sm:text-xl font-black uppercase transition-all shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] sm:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]",
                  selectedOption === option ? (
                    isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  ) : (
                    selectedOption !== null && option === tests[currentIndex].answer ? "bg-green-500 text-white" : "bg-white hover:bg-brand-muted"
                  )
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="mt-12 space-y-6">
              <div className={cn(
                "p-6 border-4 border-brand-black font-bold text-lg",
                isCorrect ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  <span className="uppercase font-black">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                <p>{tests[currentIndex].explanation}</p>
              </div>
              <Button onClick={nextTest} className="w-full py-6 text-xl">
                {currentIndex < tests.length - 1 ? 'Next Challenge' : 'Refresh Set'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </motion.div>
  );
};

const NotesView = ({ onBack }: any) => {
  const [sentenceNotes, setSentenceNotes] = useState<SentenceNote[]>([]);
  const [writingNotes, setWritingNotes] = useState<WritingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [writingReport, setWritingReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const sNotes = await noteService.getSentenceNotes();
        const wNotes = await noteService.getWritingNotes();
        setSentenceNotes(sNotes || []);
        setWritingNotes(wNotes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleGenerateReport = async () => {
    if (writingNotes.length === 0) return;
    setIsGeneratingReport(true);
    try {
      const report = await generateWritingReport(writingNotes);
      setWritingReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (loading) return <div className="text-center py-32 text-3xl uppercase font-black">Loading Archives...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="w-6 h-6" /> Back to Practice
      </Button>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
          <h3 className="text-2xl sm:text-4xl uppercase tracking-tighter doodle-underline self-start">Writing Report</h3>
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGeneratingReport || writingNotes.length === 0}
            className="bg-brand-secondary text-brand-black w-full sm:w-auto brutalist-card h-12 sm:h-auto"
          >
            {isGeneratingReport ? 'Analyzing...' : 'Generate Bi-weekly Report'}
          </Button>
        </div>
        
        {writingReport ? (
          <Card className="bg-brand-secondary/10 border-brand-secondary p-8">
            <div className="prose prose-lg max-w-none font-bold">
              <Markdown>{writingReport}</Markdown>
            </div>
          </Card>
        ) : (
          <p className="text-brand-muted font-black text-center py-10 border-4 border-brand-muted rounded-3xl">
            {writingNotes.length > 0 ? 'Click the button above to generate your bi-weekly writing proficiency report.' : 'Complete some writing tasks first to generate a report.'}
          </p>
        )}
      </div>

      <div className="space-y-8">
        <h3 className="text-4xl uppercase tracking-tighter doodle-underline">Sentence Lab Archive</h3>
        {sentenceNotes.length > 0 ? sentenceNotes.map(note => {
          const isExpanded = expandedIds.includes(note.id!);
          return (
            <Card 
              key={note.id} 
              className={cn(
                "bg-white transition-all cursor-pointer hover:shadow-lg",
                isExpanded ? "border-brand-accent" : "hover:border-brand-accent/50"
              )}
              onClick={() => toggleExpand(note.id!)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge variant="accent">{note.wordText}</Badge>
                  <span className="text-sm font-bold opacity-60 line-clamp-1 max-w-[200px] sm:max-w-md">
                    {note.originalSentence}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline font-mono text-xs opacity-50">{format(new Date(note.createdAt), 'yyyy.MM.dd')}</span>
                  <ChevronDown className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-6 border-t-2 border-brand-black/5 space-y-6">
                      <div>
                        <div className="text-[10px] font-black uppercase text-brand-accent mb-2">Original Draft</div>
                        <div className="text-xl font-bold opacity-50 italic">"{note.originalSentence}"</div>
                      </div>
                      <div className="bg-brand-secondary/10 p-4 border-2 border-brand-black text-sm font-bold">
                        <div className="text-[10px] font-black uppercase text-brand-black/40 mb-2">Feedback</div>
                        {note.feedback}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-brand-accent mb-2">Optimized Version</div>
                        <div className="text-2xl font-black">{note.optimizedSentence}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        }) : <p className="text-brand-muted font-black text-center py-20 border-4 border-brand-muted rounded-3xl">Archive is empty</p>}
      </div>

      <div className="space-y-8">
        <h3 className="text-4xl uppercase tracking-tighter doodle-underline">Essay Forge Archive</h3>
        {writingNotes.length > 0 ? writingNotes.map(note => {
          const isExpanded = expandedIds.includes(note.id!);
          return (
            <Card 
              key={note.id} 
              className={cn(
                "bg-brand-black text-white transition-all cursor-pointer hover:shadow-lg",
                isExpanded ? "border-brand-secondary" : "hover:border-brand-secondary/50"
              )}
              onClick={() => toggleExpand(note.id!)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="flex gap-2 shrink-0">
                    {note.wordTexts.slice(0, 2).map(w => <Badge key={w} variant="secondary">{w}</Badge>)}
                    {note.wordTexts.length > 2 && <Badge variant="secondary">+{note.wordTexts.length - 2}</Badge>}
                  </div>
                  <span className="text-sm font-bold opacity-60 line-clamp-1">
                    {note.content.substring(0, 50)}...
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="hidden sm:inline font-mono text-xs opacity-50">{format(new Date(note.createdAt), 'yyyy.MM.dd')}</span>
                  <ChevronDown className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-6 border-t border-white/10 space-y-6">
                      <div>
                        <div className="text-[10px] font-black uppercase text-brand-secondary mb-2">Your Writing</div>
                        <div className="text-lg opacity-60">"{note.content}"</div>
                      </div>
                      <div className="bg-brand-accent/20 p-4 border-2 border-brand-accent text-sm font-bold text-brand-accent">
                        <div className="text-[10px] font-black uppercase text-brand-accent/40 mb-2">AI Critique</div>
                        <Markdown>{note.feedback}</Markdown>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-brand-secondary mb-2">Polished Version</div>
                        <div className="text-xl font-black text-brand-secondary">
                          <Markdown>{note.optimizedContent}</Markdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        }) : <p className="text-brand-muted font-black text-center py-20 border-4 border-brand-muted rounded-3xl">Archive is empty</p>}
      </div>
    </motion.div>
  );
};

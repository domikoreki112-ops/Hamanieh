
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Facebook, 
  Phone, 
  Mail, 
  Info, 
  MessageCircle, 
  Radio as RadioIcon,
  Music,
  Share2,
  Zap,
  PhoneCall,
  Tv,
  Rss,
  Activity
} from 'lucide-react';
import { RADIO_CONFIG } from './constants';
import { Page } from './types';

// Composant Visualiseur Audio
const AudioVisualizer = ({ analyser, isPlaying }: { analyser: AnalyserNode | null, isPlaying: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Dégradé de couleur basé sur l'identité (Rouge/Or)
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#C41E3A'); // Rouge
        gradient.addColorStop(1, '#D4AF37'); // Or

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-16 opacity-80" 
      width={300} 
      height={80}
    />
  );
};

const TabBar = ({ activePage, setActivePage }: { activePage: Page; setActivePage: (p: Page) => void }) => {
  const tabs = [
    { id: Page.HOME, icon: <Tv className="w-6 h-6" />, label: 'ANTENNE' },
    { id: Page.ABOUT, icon: <Info className="w-6 h-6" />, label: 'INFOS' },
    { id: Page.CONTACT, icon: <MessageCircle className="w-6 h-6" />, label: 'CHAT' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="glass-nav rounded-2xl p-2 flex justify-between items-center px-4 shadow-2xl border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className={`flex flex-col items-center p-3 transition-all duration-300 ${activePage === tab.id ? 'text-[#D4AF37] scale-110' : 'text-gray-500 hover:text-white'}`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 font-bold tracking-tighter uppercase">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Header = () => (
  <header className="fixed top-0 left-0 w-full p-6 z-40 flex justify-center">
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-2">
        <Rss className="w-4 h-4 text-[#C41E3A] animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase">Signal Satellite Actif</span>
      </div>
    </div>
  </header>
);

const HomeView = ({ isPlaying, togglePlay, currentTrack, analyser }: { isPlaying: boolean; togglePlay: () => void; currentTrack: string; analyser: AnalyserNode | null }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 page-transition">
    {/* Digital Status Panel (Replacing the Logo) */}
    <div className="relative w-full max-w-sm">
      <div className={`absolute -inset-6 bg-blue-600/20 rounded-[2rem] blur-3xl transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className={`relative overflow-hidden rounded-2xl border-4 border-white/10 shadow-2xl transition-all duration-500 bg-[#000d1a] aspect-video flex flex-col items-center justify-center ${isPlaying ? 'scale-105 neon-border-gold' : 'grayscale-[0.5]'}`}>
        
        {/* Dynamic Text Display */}
        <div className="text-center p-6">
          <h1 className={`text-4xl font-black italic tracking-tighter transition-all duration-500 ${isPlaying ? 'text-[#D4AF37] neon-gold' : 'text-gray-600'}`}>
            HAMANIEH<br/>FLASH
          </h1>
          <div className={`mt-2 h-1 w-12 mx-auto rounded-full transition-all duration-500 ${isPlaying ? 'bg-[#C41E3A] w-24' : 'bg-gray-700 w-12'}`} />
        </div>
        
        {/* Metadata Overlay when playing */}
        <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 transition-transform duration-500 ${isPlaying ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-3 h-3 text-[#D4AF37] animate-bounce" />
            <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Live Stream</span>
          </div>
          
          <p className="text-white text-xs font-bold truncate tracking-tight mb-2">
            {currentTrack || "Hamanieh Flash - Le Direct"}
          </p>

          {/* Audio Visualizer Component */}
          <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
        </div>

        {/* Signal scan effect */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10 animate-[scan_3s_linear_infinite]" />
          </div>
        )}
      </div>
    </div>

    {/* Slogan & Main Info */}
    <div className="text-center space-y-6 w-full max-w-xs">
      <div className="space-y-3">
        <p className="text-[#D4AF37] font-bold italic text-lg tracking-tight neon-gold leading-tight">
          "{RADIO_CONFIG.SLOGAN}"
        </p>
        <div className="h-0.5 w-16 bg-[#C41E3A] mx-auto rounded-full" />
      </div>

      <div className="relative inline-block">
        <button 
          onClick={togglePlay}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl mx-auto group z-10 relative ${isPlaying ? 'bg-[#C41E3A] rotate-90 shadow-[0_0_40px_rgba(196,30,58,0.6)]' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {isPlaying ? 
            <Pause className="w-10 h-10 text-white fill-current -rotate-90" /> : 
            <Play className="w-10 h-10 text-white fill-current ml-1" />
          }
        </button>
        {/* Pulsing rings when playing */}
        {isPlaying && (
          <>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-[#C41E3A] animate-ping opacity-20" />
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-[#C41E3A] animate-ping opacity-10 [animation-delay:0.5s]" />
          </>
        )}
      </div>

      <div className="flex justify-between items-center px-4 pt-2">
        <a href={RADIO_CONFIG.FACEBOOK} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-[#D4AF37]/20 transition-colors"><Facebook className="w-5 h-5 text-blue-400" /></a>
        <a href={RADIO_CONFIG.TIKTOK} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-[#D4AF37]/20 transition-colors"><Music className="w-5 h-5" /></a>
        <a href={`https://wa.me/${RADIO_CONFIG.WHATSAPP}`} className="p-3 bg-white/5 rounded-xl hover:bg-green-500/20 transition-colors"><MessageCircle className="w-5 h-5 text-green-500" /></a>
        <button onClick={() => {
          if (navigator.share) {
            navigator.share({ title: 'Hamanieh Flash', text: RADIO_CONFIG.SLOGAN, url: window.location.href });
          }
        }} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"><Share2 className="w-5 h-5" /></button>
      </div>
    </div>
  </div>
);

const AboutView = () => (
  <div className="min-h-screen pt-32 pb-40 px-6 max-w-md mx-auto space-y-8 page-transition">
    <div className="text-center space-y-2">
      <h2 className="text-3xl font-black uppercase gold-text italic tracking-tighter">Notre Vision</h2>
      <div className="h-1 w-20 bg-[#C41E3A] mx-auto rounded-full" />
    </div>

    <div className="space-y-6 text-center text-gray-300">
      <div className="p-8 glass-nav rounded-[2rem] border-white/5 space-y-4 shadow-xl">
        <RadioIcon className="w-12 h-12 mx-auto text-[#D4AF37] mb-2" />
        <h3 className="text-xl font-bold text-white uppercase italic">HAMANIEH FLASH</h3>
        <p className="text-sm font-bold text-[#D4AF37] mb-4">"{RADIO_CONFIG.SLOGAN}"</p>
        <p className="leading-relaxed text-sm opacity-90">
          Radio d'actualité et de musique, nous nous engageons à vous fournir une information vérifiée, pertinente et traitée sous un angle unique.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 glass-nav rounded-2xl border-white/5 flex items-center justify-between">
          <div className="text-left">
            <h4 className="font-bold text-white text-sm uppercase">Couverture</h4>
            <p className="text-[10px] text-gray-500">Mondiale via Digital</p>
          </div>
          <Zap className="w-6 h-6 text-[#C41E3A]" />
        </div>
      </div>
    </div>
  </div>
);

const ContactView = () => (
  <div className="min-h-screen pt-32 pb-40 px-6 max-w-md mx-auto space-y-8 page-transition">
    <div className="text-center space-y-2">
      <h2 className="text-3xl font-black uppercase gold-text italic tracking-tighter">Rédaction</h2>
      <div className="h-1 w-20 bg-[#C41E3A] mx-auto rounded-full" />
    </div>

    <div className="space-y-4">
      <a href={`tel:${RADIO_CONFIG.PHONE}`} className="flex items-center p-5 glass-nav rounded-2xl group border-white/5 hover:bg-white/5 transition-all">
        <div className="w-12 h-12 bg-[#C41E3A]/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#C41E3A] transition-colors">
          <PhoneCall className="w-6 h-6 text-[#C41E3A] group-hover:text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase">Ligne directe</p>
          <p className="font-bold">{RADIO_CONFIG.PHONE}</p>
        </div>
      </a>

      <a href={`mailto:${RADIO_CONFIG.EMAIL}`} className="flex items-center p-5 glass-nav rounded-2xl group border-white/5 hover:bg-white/5 transition-all">
        <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#D4AF37] transition-colors">
          <Mail className="w-6 h-6 text-[#D4AF37] group-hover:text-black" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Rédaction / Mail</p>
          <p className="font-bold truncate text-sm">{RADIO_CONFIG.EMAIL}</p>
        </div>
      </a>
    </div>

    <div className="glass-nav p-8 rounded-[2rem] border-white/5 space-y-4 shadow-2xl">
      <h4 className="text-sm font-bold uppercase tracking-widest text-center mb-2">Envoyez une info</h4>
      <textarea 
        placeholder="Votre témoignage ou message..." 
        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#D4AF37] text-white"
        rows={3}
      />
      <button className="w-full py-4 bg-[#D4AF37] text-black font-black uppercase rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
        Transmettre
      </button>
    </div>
  </div>
);

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePage, setActivePage] = useState<Page>(Page.HOME);
  const [currentTrack, setCurrentTrack] = useState<string>("Chargement du direct...");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Simulation of dynamic metadata updates (Show titles / Song names)
  useEffect(() => {
    const shows = [
      "Hamanieh Flash - Le Grand Mix",
      "Hamanieh Flash - L'info en continu",
      "Hamanieh Flash - Flash Actu",
      "Hamanieh Flash - Spécial Abidjan",
      "Hamanieh Flash - Musiques d'Ailleurs"
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTrack(shows[index]);
        index = (index + 1) % shows.length;
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialisation de l'audio et de l'analyseur
  useEffect(() => {
    const audio = new Audio(RADIO_CONFIG.STREAM_URL);
    audio.preload = "none";
    audio.crossOrigin = "anonymous"; // Important pour le Web Audio API
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // Nombre de barres (petit pour l'esthétique)

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    initAudioContext();

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      setIsPlaying(false);
    } else {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audioRef.current.src = RADIO_CONFIG.STREAM_URL;
      audioRef.current.play().catch(e => console.error("Erreur de lecture:", e));
      setIsPlaying(true);
      setCurrentTrack("Hamanieh Flash - Connexion en cours...");
    }
  }, [isPlaying, initAudioContext]);

  return (
    <div className="relative min-h-screen bg-[#000814] text-white">
      {/* Immersive Background */}
      <div 
        className="fixed inset-0 z-0 opacity-10 transition-all duration-1000 scale-105"
        style={{ 
          backgroundImage: `url(${RADIO_CONFIG.HERO_IMAGE})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          filter: isPlaying ? 'blur(3px) saturate(1.5)' : 'blur(8px) saturate(0)'
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#000814] via-[#001f3f]/90 to-[#000814] z-0" />
      
      <Header />
      
      <main className="relative z-10">
        {activePage === Page.HOME && (
          <HomeView 
            isPlaying={isPlaying} 
            togglePlay={togglePlay} 
            currentTrack={currentTrack} 
            analyser={analyserRef.current} 
          />
        )}
        {activePage === Page.ABOUT && <AboutView />}
        {activePage === Page.CONTACT && <ContactView />}
      </main>

      <TabBar activePage={activePage} setActivePage={setActivePage} />

      {/* Style Global */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

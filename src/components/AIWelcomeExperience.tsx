import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store/useStore";
import { Button, Card, Badge, getAccentClass } from "./UI";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  ChevronRight,
  Play,
  CheckCircle2,
  Cpu,
  Brain,
  ShieldCheck,
  RefreshCw,
  X,
  Layers,
  Activity,
  Database,
  Eye,
  Settings,
  Keyboard,
  HelpCircle,
  Accessibility
} from "lucide-react";

interface AIWelcomeExperienceProps {
  onComplete: () => void;
  localCompanies?: any[];
  localEmployees?: any[];
}

interface VoiceSettings {
  provider: "browser" | "elevenlabs" | "openai" | "azure" | "google" | "polly" | "cartesia";
  voiceName: string; // for browser
  voiceId: string;   // for elevenlabs/cartesia
  openaiVoice: string; // alloy, etc
  azureVoice: string;
  googleVoice: string;
  speed: number;
  pitch: number;
  volume: number;
  mute: boolean;
  verboseMode: "minimal" | "executive" | "verbose";
  playOncePerSession: boolean;
  reducedMotion: boolean;
}

// Particle class for the stunning space backdrop
class SpaceParticle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 0;
  alpha: number = 0;
  color: string = "";

  constructor(width: number, height: number) {
    this.reset(width, height, true);
  }

  reset(width: number, height: number, init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : height + 10;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = -Math.random() * 0.4 - 0.1;
    this.size = Math.random() * 2.0 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7 ? "129, 140, 248" : "113, 113, 122"; // Indigo or Zinc
  }

  update(width: number, height: number, speedMultiplier: number) {
    this.x += this.vx * speedMultiplier;
    this.y += this.vy * speedMultiplier;
    if (this.y < -10 || this.x < -10 || this.x > width + 10) {
      this.reset(width, height, false);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}

export const AIWelcomeExperience: React.FC<AIWelcomeExperienceProps> = ({
  onComplete,
  localCompanies = [],
  localEmployees = []
}) => {
  const { currentUser, currentUserRole } = useStore();

  // Unified sequence timeline state machine
  // blackout -> logo_reveal -> system_boot -> speaker_console
  const [timeline, setTimeline] = useState<"blackout" | "logo_reveal" | "system_boot" | "speaker_console">("blackout");
  const [bootStep, setBootStep] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);

  // Holographic avatar eye-blinking and visual states
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [eyeDirection, setEyeDirection] = useState<"center" | "left" | "right">("center");

  // Persistent settings stored in local/session storage
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem("ex_voice_settings_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all properties exist
        return {
          provider: "browser",
          voiceName: "",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
          openaiVoice: "alloy",
          azureVoice: "en-US-GuyNeural",
          googleVoice: "en-US-Wavenet-F",
          speed: 1.0,
          pitch: 1.0,
          volume: 1.0,
          mute: false,
          verboseMode: "executive",
          playOncePerSession: true,
          reducedMotion: false,
          ...parsed
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      provider: "browser",
      voiceName: "",
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
      openaiVoice: "alloy",
      azureVoice: "en-US-GuyNeural",
      googleVoice: "en-US-Wavenet-F",
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      mute: false,
      verboseMode: "executive",
      playOncePerSession: true,
      reducedMotion: false
    };
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SpaceParticle[]>([]);

  // Sequential lines detailing Exshopi AI boot logs
  const bootLogs = [
    { text: "INITIALIZING EXSHOPI AI CORE...", desc: "Calibrating synapse vectors", icon: Cpu },
    { text: "Loading Enterprise Intelligence...", desc: "Linking neural policy modules", icon: Brain },
    { text: "Authenticating Workspace...", desc: "Secure ledger validated compliant", icon: ShieldCheck },
    { text: "Synchronizing Global Systems...", desc: "REST gateway endpoints handshake ok", icon: Layers },
    { text: "Connecting AI Workforce...", desc: `Activating ${localEmployees.length || 3} autonomous worker units`, icon: Database },
    { text: "Activating Voice Intelligence...", desc: "Abstract master speech layer ready", icon: Activity },
    { text: "Loading Company Memory...", desc: "Loaded historical workspace context", icon: RefreshCw },
    { text: "Enterprise Ready.", desc: "Handshake verified. Access granted", icon: CheckCircle2 }
  ];

  const activeCompany = localCompanies?.[0]?.company_name || "Exshopi AI Labs";
  const userName = currentUser?.full_name || "Ahsan Haji";
  const agentCount = localEmployees?.length || 3;

  // Curated highly professional, calm speech scripts based on Verbose modes
  const getGreetingScript = () => {
    if (voiceSettings.verboseMode === "minimal") {
      return [
        `Welcome, ${userName}.`,
        `Exshopi operating system is active.`,
        `All workspace systems are fully online and ready.`
      ];
    } else if (voiceSettings.verboseMode === "executive") {
      return [
        `Welcome back to Exshopi AI.`,
        `Good day, ${userName}. All secure enterprise pipelines are verified online under ${activeCompany}.`,
        `Your autonomous workforce is running at maximum efficiency with ${agentCount} active agents deployed.`,
        `I have successfully prepared your strategic executive briefing for today.`
      ];
    } else {
      // Verbose mode
      return [
        `System initialization completed at forty-eight kilohertz sample rate.`,
        `Good day, ${userName}. We have successfully synchronized operations under the context of ${activeCompany}.`,
        `Security systems report zero active system anomalies in your primary queue. All audited endpoints conform to standard SOC-two controls.`,
        `Your workforce of ${agentCount} autonomous AI agents is operating at optimal SLAs.`,
        `I am fully prepared to execute your strategic instructions. Would you like me to read today's comprehensive briefing?`
      ];
    }
  };

  const getBriefingScript = () => {
    return [
      `Initiating deep company status review.`,
      `Active annual net target stands at twelve million dollars, with a verified run rate performance of ten point four million.`,
      `Sophia AI is currently dispatched on sales outreach campaigns, achieving a forty-two percent demo booking response rate.`,
      `Carter Security telemetry has blocked one thousand three hundred ninety-four unauthorized access attempts this week.`,
      `The operational workspace is fully certified. I am standing by to automate your growth objectives.`
    ];
  };

  const [scriptType, setScriptType] = useState<"greeting" | "briefing">("greeting");
  const sentences = scriptType === "greeting" ? getGreetingScript() : getBriefingScript();

  // Save voice settings to localStorage
  useEffect(() => {
    localStorage.setItem("ex_voice_settings_v2", JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // Load SpeechSynthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
        setAvailableVoices(voices);
        if (voices.length > 0 && !voiceSettings.voiceName) {
          setVoiceSettings((prev) => ({ ...prev, voiceName: voices[0].name }));
        }
      }
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Web Audio Synth: Low Frequency Cinematic Drone
  const playCinematicDrone = () => {
    if (typeof window === "undefined" || voiceSettings.mute) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      osc1.frequency.linearRampToValueAtTime(45, ctx.currentTime + 3);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(55.6, ctx.currentTime); // slight pitch discrepancy for beating
      osc2.frequency.linearRampToValueAtTime(45.6, ctx.currentTime + 3);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(90, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 4.2);
      osc2.stop(ctx.currentTime + 4.2);
    } catch (err) {
      console.warn("Web Audio Drone failed:", err);
    }
  };

  // Web Audio Synth: Majestic Operating System Startup Chime
  const playStartupChime = () => {
    if (typeof window === "undefined" || voiceSettings.mute) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      // Lush cinematic major chord stack: C2, C3, G3, C4, E4, G4, B4, D5, G5
      const notes = [65.41, 130.81, 196.00, 261.63, 329.63, 392.00, 493.88, 587.33, 783.99];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.15);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);

      // Creative delay feedback acting as deep space reverb
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.28, ctx.currentTime);
      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime(0.45, ctx.currentTime);

      delay.connect(delayGain);
      delayGain.connect(delay); // loop back

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(120, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1400 - idx * 75, ctx.currentTime + 0.45);
        filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 3.8);

        oscGain.gain.setValueAtTime(0, ctx.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1 + idx * 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8 + Math.random() * 1.5);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        osc.stop(ctx.currentTime + 5.5);
      });

      masterGain.connect(ctx.destination);
      masterGain.connect(delay);
      delayGain.connect(ctx.destination);
    } catch (err) {
      console.warn("Web Audio Chime failed:", err);
    }
  };

  // Canvas particle background system logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Populate particles
    const particleCount = voiceSettings.reducedMotion ? 15 : 65;
    particlesRef.current = Array.from({ length: particleCount }, () => new SpaceParticle(width, height));

    const drawLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Gradient background glow overlay
      const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.8);
      radialGlow.addColorStop(0, "rgba(24, 24, 27, 0.0)");
      radialGlow.addColorStop(1, "rgba(9, 9, 11, 0.9)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        p.update(width, height, isSpeaking ? 2.5 : 1.0);
        p.draw(ctx);
      });

      // Draw vector connector nets
      if (!voiceSettings.reducedMotion) {
        ctx.strokeStyle = "rgba(129, 140, 248, 0.04)";
        ctx.lineWidth = 0.5;
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [timeline, isSpeaking, voiceSettings.reducedMotion]);

  // Cinematic sequence timeline orchestration
  useEffect(() => {
    // Phase 1: Absolute silence for 500ms
    const timer1 = setTimeout(() => {
      setTimeline("logo_reveal");
      playCinematicDrone();
    }, 500);

    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (timeline !== "logo_reveal") return;

    // Phase 2: Logo fades & light sweeps, then trigger boot sequence
    const timer2 = setTimeout(() => {
      setTimeline("system_boot");
      playStartupChime();
    }, 2800);

    return () => clearTimeout(timer2);
  }, [timeline]);

  // Sequence through individual boot logs naturally
  useEffect(() => {
    if (timeline !== "system_boot") return;

    if (bootStep < bootLogs.length) {
      const staggerTime = voiceSettings.reducedMotion ? 150 : 450;
      const timer = setTimeout(() => {
        setBootStep((prev) => prev + 1);
      }, staggerTime);
      return () => clearTimeout(timer);
    } else {
      // Completed boot logs, open the primary console
      const timer = setTimeout(() => {
        setTimeline("speaker_console");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [timeline, bootStep, voiceSettings.reducedMotion]);

  // Trigger vocal synthesis on entering the final speaker console
  useEffect(() => {
    if (timeline === "speaker_console") {
      playScript("greeting");
    }
    return () => stopSpeech();
  }, [timeline]);

  // Keyboard shortcut listeners for Accessibility compliance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();
      if (key === " ") {
        e.preventDefault();
        setVoiceSettings((prev) => ({ ...prev, mute: !prev.mute }));
      } else if (key === "s") {
        handleSkip();
      } else if (key === "v") {
        setShowSettings((prev) => !prev);
      } else if (key === "k") {
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sentences, activeSentenceIndex]);

  // Holographic avatar random blinking and eye-movement loops
  useEffect(() => {
    if (timeline !== "speaker_console") return;

    // Blinking trigger interval
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);

    // Eye direction shifts representing high intelligence analysis
    const eyeInterval = setInterval(() => {
      const directions: ("center" | "left" | "right")[] = ["center", "left", "right"];
      const rand = directions[Math.floor(Math.random() * directions.length)];
      setEyeDirection(rand);
    }, 4500);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(eyeInterval);
    };
  }, [timeline]);

  // Robust Text-to-Speech engine proxy and fallback mechanism
  const speakText = async (text: string, sentenceIndex: number) => {
    if (voiceSettings.mute) return;

    setActiveSentenceIndex(sentenceIndex);

    if (voiceSettings.provider === "browser") {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      if (voiceSettings.voiceName) {
        const selectedVoice = availableVoices.find((v) => v.name === voiceSettings.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      }

      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (sentenceIndex + 1 < sentences.length) {
          speakText(sentences[sentenceIndex + 1], sentenceIndex + 1);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Professional Server-side backend TTS Proxy
      try {
        setIsSpeaking(true);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const res = await fetch("/api/v1/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            provider: voiceSettings.provider,
            voiceSettings: {
              voiceId: voiceSettings.voiceId,
              voice: voiceSettings.openaiVoice,
              speed: voiceSettings.speed,
              pitch: voiceSettings.pitch,
              volume: voiceSettings.volume
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Proxy request rejected");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.volume = voiceSettings.volume;
        audio.playbackRate = voiceSettings.speed;

        audio.onended = () => {
          setIsSpeaking(false);
          if (sentenceIndex + 1 < sentences.length) {
            speakText(sentences[sentenceIndex + 1], sentenceIndex + 1);
          }
        };

        audio.onerror = () => {
          console.warn("Proxy audio playback failed. Triggering immediate browser TTS fallback.");
          fallbackToBrowserSpeech(text, sentenceIndex);
        };

        await audio.play();
      } catch (err: any) {
        console.warn(`Proxy synthesis unavailable: ${err.message}. Falling back to browser speech synthesis.`);
        fallbackToBrowserSpeech(text, sentenceIndex);
      }
    }
  };

  const fallbackToBrowserSpeech = (text: string, sentenceIndex: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (availableVoices.length > 0) {
      // Find a premium-sounding voice if available
      const premium = availableVoices.find(v => v.name.includes("Google") || v.name.includes("Natural")) || availableVoices[0];
      utterance.voice = premium;
    }
    utterance.rate = voiceSettings.speed;
    utterance.volume = voiceSettings.volume;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (sentenceIndex + 1 < sentences.length) {
        speakText(sentences[sentenceIndex + 1], sentenceIndex + 1);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const playScript = (type: "greeting" | "briefing") => {
    setScriptType(type);
    stopSpeech();
    const activeSentences = type === "greeting" ? getGreetingScript() : getBriefingScript();
    setTimeout(() => {
      speakText(activeSentences[0], 0);
    }, 150);
  };

  const stopSpeech = () => {
    setIsSpeaking(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const handleSkip = () => {
    stopSpeech();
    sessionStorage.setItem("ex_welcome_played", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center p-6 text-zinc-100 overflow-y-auto select-none selection:bg-indigo-500/30">
      
      {/* Immersive space canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Cinematic HUD Border Overlay */}
      <div className="absolute inset-4 border border-zinc-900/40 rounded-3xl pointer-events-none z-10 flex flex-col justify-between p-4 text-[10px] font-mono text-zinc-600">
        <div className="flex justify-between items-center">
          <span>SECURE PROTOCOL // 48KHZ AUDIO MATRIX</span>
          <span>LATITUDE: 48.1351 // LONGITUDE: 11.5820</span>
        </div>
        <div className="flex justify-between items-center">
          <span>SYSTEM DISPATCH HANDSHAKE VERIFIED</span>
          <span>© EXSHOPI OPERATING KERNEL V2</span>
        </div>
      </div>

      {/* Floating control buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-30 font-sans">
        <Badge variant="success" className="text-[9px] font-mono tracking-widest uppercase bg-emerald-950/40 border-emerald-500/20 text-emerald-400">
          SECURE HANDSHAKE
        </Badge>
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            showShortcuts ? "bg-zinc-850 border-zinc-700 text-zinc-100" : "border-zinc-900 bg-zinc-950/80 text-zinc-500 hover:text-zinc-300"
          }`}
          title="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>
        <button
          onClick={handleSkip}
          className="text-2xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 font-mono bg-zinc-950/80 px-3 py-2 border border-zinc-900 rounded-lg cursor-pointer"
        >
          Skip Experience <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center justify-center z-20">
        
        <AnimatePresence mode="wait">
          
          {/* BLACKOUT INTRO */}
          {timeline === "blackout" && (
            <motion.div
              key="blackout"
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-50 flex items-center justify-center"
            />
          )}

          {/* PHASE 1: LOGO REVEAL WITH LIGHT SWEEP */}
          {timeline === "logo_reveal" && (
            <motion.div
              key="logo_reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-center text-center space-y-6"
            >
              {/* Premium holographic logo container */}
              <div className="relative h-24 w-24 flex items-center justify-center">
                {/* Glowing neon halo rings */}
                <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-2xl animate-pulse" />
                <div className="absolute -inset-1 border border-indigo-500/10 rounded-3xl animate-spin [animation-duration:12s]" />
                
                <div className="h-20 w-20 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <span className="text-4xl select-none">⚡</span>
                  
                  {/* Sliding light-sweep overlay */}
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase bg-clip-text">
                  EXSHOPI AI <span className="text-indigo-400">V2</span>
                </h1>
                <p className="text-4xs text-zinc-500 font-mono tracking-[0.25em] uppercase">
                  Enterprise Autonomous Intelligence Core
                </p>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: DETAILED SYSTEM LOGS REVEAL */}
          {timeline === "system_boot" && (
            <motion.div
              key="system_boot"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="text-center space-y-1.5">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-400 mx-auto" />
                <h2 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-widest">
                  Booting System Kernels
                </h2>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  Initializing secure handshakes...
                </p>
              </div>

              {/* Staggered system log matrix */}
              <div className="bg-zinc-900/50 border border-zinc-850/60 rounded-2xl p-5 space-y-3.5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-indigo-500/[0.01] pointer-events-none" />
                
                {bootLogs.map((log, idx) => {
                  const Icon = log.icon;
                  const isDone = idx < bootStep;
                  const isActive = idx === bootStep;
                  
                  return (
                    <div
                      key={log.text}
                      className={`flex items-center justify-between transition-all duration-300 ${
                        isDone ? "opacity-100" : isActive ? "opacity-100 scale-[1.01]" : "opacity-15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg border transition-colors ${
                          isDone ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-400" : "bg-zinc-950 border-zinc-850 text-zinc-500"
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200 font-sans tracking-wide">{log.text}</span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{log.desc}</span>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shadow-md shadow-emerald-500/5" />
                        ) : isActive ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PHASE 3: INTERACTIVE SPEAKER CONSOLE WITH HOLOGRAPHIC AVATAR */}
          {timeline === "speaker_console" && (
            <motion.div
              key="speaker_console"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              
              {/* Left Side: Waveform, Captions & Interactive Avatar */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                
                <Card className="p-6 border-zinc-850 bg-zinc-900/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between flex-1 shadow-2xl">
                  
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-850/60">
                    <div className="flex items-center gap-2">
                      <div className="relative h-2 w-2 flex items-center justify-center">
                        <span className={`absolute h-2.5 w-2.5 rounded-full ${isSpeaking ? "bg-emerald-500 animate-ping" : "bg-amber-400"}`} />
                        <span className={`h-1.5 w-1.5 rounded-full ${isSpeaking ? "bg-emerald-500" : "bg-amber-500"}`} />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider font-mono text-zinc-400 uppercase">
                        {isSpeaking ? "Vocalizing updates" : "Ready for instructions"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVoiceSettings(prev => ({ ...prev, mute: !prev.mute }))}
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer"
                        title={voiceSettings.mute ? "Unmute Voice" : "Mute Voice"}
                      >
                        {voiceSettings.mute ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          showSettings ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-400" : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                        title="Configure AI Voice System"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Settings Control Panel Drawer */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-zinc-950/90 border border-zinc-850/70 rounded-2xl p-4.5 mt-3 space-y-4 text-xs font-sans backdrop-blur-2xl z-30"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-300 font-mono uppercase tracking-wider text-[10px]">Speech Matrix Configuration</span>
                          <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">TTS Engine Provider</label>
                            <select
                              value={voiceSettings.provider}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, provider: e.target.value as any }))}
                              className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500/50"
                            >
                              <option value="browser">Browser Native (Offline)</option>
                              <option value="openai">OpenAI Voice API</option>
                              <option value="elevenlabs">ElevenLabs Synthesis</option>
                              <option value="azure">Azure Speech Cloud</option>
                              <option value="google">Google Cloud TTS</option>
                              <option value="cartesia">Cartesia Sonic</option>
                            </select>
                          </div>

                          {/* Options based on Provider */}
                          {voiceSettings.provider === "browser" && (
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Accent Accentuation</label>
                              <select
                                value={voiceSettings.voiceName}
                                onChange={(e) => setVoiceSettings(prev => ({ ...prev, voiceName: e.target.value }))}
                                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500/50"
                              >
                                {availableVoices.map((v) => (
                                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {voiceSettings.provider === "openai" && (
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">OpenAI Persona Voice</label>
                              <select
                                value={voiceSettings.openaiVoice}
                                onChange={(e) => setVoiceSettings(prev => ({ ...prev, openaiVoice: e.target.value }))}
                                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500/50"
                              >
                                <option value="alloy">Alloy (Neutral)</option>
                                <option value="echo">Echo (Warm)</option>
                                <option value="fable">Fable (British)</option>
                                <option value="onyx">Onyx (Deep Male)</option>
                                <option value="nova">Nova (Bright Female)</option>
                                <option value="shimmer">Shimmer (Clear Female)</option>
                              </select>
                            </div>
                          )}

                          {voiceSettings.provider === "elevenlabs" && (
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">ElevenLabs Voice ID</label>
                              <input
                                type="text"
                                value={voiceSettings.voiceId}
                                onChange={(e) => setVoiceSettings(prev => ({ ...prev, voiceId: e.target.value }))}
                                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500/50 font-mono text-[10px]"
                                placeholder="Voice Token ID"
                              />
                            </div>
                          )}

                          {(voiceSettings.provider === "azure" || voiceSettings.provider === "google") && (
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Cloud Pitch Profile</label>
                              <Badge variant="accent" className="w-full justify-center py-2 bg-zinc-900 border-zinc-800 text-zinc-400">
                                Default Neural Accent
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Sliders */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500 font-bold">Speed</span>
                              <span className="text-zinc-300 font-mono">{voiceSettings.speed}x</span>
                            </div>
                            <input
                              type="range" min="0.6" max="1.6" step="0.1"
                              value={voiceSettings.speed}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500 font-bold">Pitch</span>
                              <span className="text-zinc-300 font-mono">{voiceSettings.pitch}x</span>
                            </div>
                            <input
                              type="range" min="0.5" max="1.5" step="0.1"
                              disabled={voiceSettings.provider !== "browser"}
                              value={voiceSettings.pitch}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500 font-bold">Volume</span>
                              <span className="text-zinc-300 font-mono">{Math.round(voiceSettings.volume * 100)}%</span>
                            </div>
                            <input
                              type="range" min="0.0" max="1.0" step="0.05"
                              value={voiceSettings.volume}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Verbosity and accessibility switches */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-850">
                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">AI Personality Mode</label>
                            <select
                              value={voiceSettings.verboseMode}
                              onChange={(e) => {
                                const mode = e.target.value as any;
                                setVoiceSettings(prev => ({ ...prev, verboseMode: mode }));
                                setTimeout(() => playScript("greeting"), 200);
                              }}
                              className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500/50"
                            >
                              <option value="minimal">Minimalist Mode</option>
                              <option value="executive">Executive Brief Mode</option>
                              <option value="verbose">Comprehensive Chief Mode</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2 pt-1.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={voiceSettings.reducedMotion}
                                onChange={(e) => setVoiceSettings(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                                className="rounded bg-zinc-900 border-zinc-800 text-indigo-500 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-zinc-400 text-[10px] font-semibold">Reduced Motion</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={voiceSettings.playOncePerSession}
                                onChange={(e) => setVoiceSettings(prev => ({ ...prev, playOncePerSession: e.target.checked }))}
                                className="rounded bg-zinc-900 border-zinc-800 text-indigo-500 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-zinc-400 text-[10px] font-semibold">Play Once Per Session</span>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* High-Fidelity Holographic Assistant Visualizer Avatar */}
                  <div className="my-8 flex flex-col items-center justify-center">
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      
                      {/* Dynamic glowing neon visualizer orbits */}
                      <div className="absolute inset-0 rounded-full border border-indigo-500/10 scale-110" />
                      
                      <AnimatePresence>
                        {isSpeaking && (
                          <>
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: [1, 1.45, 1], opacity: [0.15, 0.45, 0.15] }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"
                            />
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.35, 0.1] }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                              className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl"
                            />
                          </>
                        )}
                      </AnimatePresence>

                      {/* Continuous breathing container */}
                      <motion.div
                        animate={voiceSettings.reducedMotion ? {} : {
                          scale: [1, 1.03, 1],
                        }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-24 w-24 rounded-full border-2 border-indigo-500/40 bg-zinc-950 p-1 flex items-center justify-center relative overflow-hidden shadow-2xl"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                          alt="AI Chief Executive Operator"
                          className="h-full w-full object-cover rounded-full filter saturate-75 opacity-90"
                          referrerPolicy="no-referrer"
                        />

                        {/* Holographic scanning HUD line */}
                        {!voiceSettings.reducedMotion && (
                          <div className="absolute inset-x-0 h-0.5 bg-indigo-400/50 blur-sm animate-[sweep_2.2s_infinite]" />
                        )}

                        {/* Eye pupil direction shift and blink mask layer */}
                        {isBlinking ? (
                          <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-bold">BLINK</span>
                          </div>
                        ) : (
                          eyeDirection !== "center" && (
                            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none transition-all duration-300">
                              <span className={`absolute text-[7px] text-indigo-400/30 font-mono ${
                                eyeDirection === "left" ? "left-4 top-1/2" : "right-4 top-1/2"
                              }`}>●</span>
                            </div>
                          )
                        )}

                        {/* Live active speaking audio-spectrum overlay */}
                        {isSpeaking && (
                          <div className="absolute inset-0 bg-indigo-950/25 flex items-center justify-center backdrop-blur-[0.5px]">
                            <div className="flex gap-1 justify-center items-end h-8">
                              <span className="h-5 w-0.5 bg-emerald-400 rounded animate-bounce [animation-duration:0.6s]" />
                              <span className="h-8 w-0.5 bg-emerald-400 rounded animate-bounce [animation-delay:0.1s] [animation-duration:0.4s]" />
                              <span className="h-6 w-0.5 bg-emerald-400 rounded animate-bounce [animation-delay:0.2s] [animation-duration:0.7s]" />
                              <span className="h-4 w-0.5 bg-emerald-400 rounded animate-bounce [animation-delay:0.3s] [animation-duration:0.5s]" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 mt-4 uppercase">
                      Ex-CEO Systems Operator
                    </span>
                  </div>

                  {/* Captions subtitles panel */}
                  <div className="bg-zinc-950/50 border border-zinc-850 p-4.5 rounded-2xl min-h-[5.5rem] flex items-center justify-center text-center backdrop-blur-md relative overflow-hidden">
                    <p className="text-xs text-zinc-300 leading-relaxed max-w-lg font-sans">
                      {sentences.map((sentence, idx) => (
                        <span
                          key={sentence}
                          className={`transition-colors duration-200 mx-1 ${
                            idx === activeSentenceIndex && isSpeaking
                              ? "text-indigo-400 font-semibold drop-shadow-[0_0_12px_rgba(129,140,248,0.35)]"
                              : idx < activeSentenceIndex
                              ? "text-zinc-600"
                              : "text-zinc-300"
                          }`}
                        >
                          {sentence}{" "}
                        </span>
                      ))}
                    </p>
                  </div>

                </Card>

              </div>

              {/* Right Side: Handshake Diagnostic Details & Quick Decisions */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                
                <Card className="p-6 border-zinc-850 bg-zinc-900/10 backdrop-blur-xl flex flex-col justify-between flex-1 shadow-2xl">
                  
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-850/60 mb-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Workspace Diagnostic Telemetry</span>
                      <Badge variant="success" className="bg-emerald-950/40 border-emerald-500/20 text-emerald-400">Handshake Verified</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-indigo-400">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Tenant Context</span>
                          <p className="text-xs font-semibold text-zinc-200 mt-0.5">{activeCompany}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-emerald-400">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Authenticated Operator</span>
                          <p className="text-xs font-semibold text-zinc-200 mt-0.5">{userName}</p>
                          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">{currentUserRole} Access Status</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-amber-400">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Deployed Workforce</span>
                          <p className="text-xs font-semibold text-zinc-200 mt-0.5">{agentCount} Active Autonomous Agents</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Directives */}
                  <div className="mt-8 pt-5 border-t border-zinc-850/60 space-y-3 font-sans">
                    {scriptType === "greeting" ? (
                      <>
                        <Button
                          variant="primary"
                          className="w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold"
                          icon={<Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />}
                          onClick={() => playScript("briefing")}
                        >
                          Authorize Executive Briefing
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold border-zinc-800 hover:bg-zinc-900"
                          onClick={handleSkip}
                        >
                          Skip Briefing, Enter Workspace
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          className="w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold"
                          icon={<ChevronRight className="h-4 w-4" />}
                          onClick={handleSkip}
                        >
                          Acknowledge & Access Workspace
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold border-zinc-800 hover:bg-zinc-900"
                          icon={<Play className="h-3.5 w-3.5" />}
                          onClick={() => playScript("greeting")}
                        >
                          Replay Greeting Narrative
                        </Button>
                      </>
                    )}
                  </div>

                </Card>

              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Keyboard Shortcuts Dialog Help Box */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative font-sans">
              <button
                onClick={() => setShowShortcuts(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-zinc-200 uppercase tracking-wider text-xs">Accessibility Handlers</h3>
              </div>
              
              <p className="text-2xs text-zinc-400 leading-relaxed">
                We have incorporated complete screen-reader compatibility and intuitive, one-touch keyboard controls to optimize your cinematic executive operating cockpit:
              </p>

              <div className="space-y-2.5 font-mono text-[10px]">
                <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-zinc-500 font-bold uppercase">Toggle Voice / Mute</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">Space</kbd>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-zinc-500 font-bold uppercase">Skip to Dashboard</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">S</kbd>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-zinc-500 font-bold uppercase">Toggle Speech Matrix</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">V</kbd>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-zinc-500 font-bold uppercase">Toggle Helpers Drawer</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">K</kbd>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

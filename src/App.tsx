import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  setDoc, 
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { 
  processMemory, 
  generateEvolution,
  auditItems,
  suggestRepair,
  generateChatResponse
} from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Database, 
  History, 
  Send, 
  LogOut, 
  LogIn, 
  Cpu, 
  Sparkles,
  AlertCircle,
  Shield,
  Target,
  Filter,
  Activity,
  Terminal,
  RefreshCcw,
  Binary,
  ChevronDown,
  ChevronUp,
  Bot,
  User as UserIcon,
  Coins,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import geneticRegistry from '../genetic_registry.json';
import { SiphonCoreVisualizer } from './components/SiphonCoreVisualizer';
import { LogicStream } from './components/LogicStream';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { GatewayInspector } from './components/GatewayInspector';
import { DeepThinkerAuditor } from './components/DeepThinkerAuditor';

// --- Interfaces ---
interface Memory {
  id: string;
  content: string;
  category: string;
  timestamp: any;
  importance: number;
  utilityScore?: number;
  multiplicity?: number;
  lastReferenced?: any;
  autonomous?: boolean;
  isTeleologicalConstraint?: boolean;
  reply?: string;
  reflection?: string;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    modelUsed: string;
  };
  failureContext?: {
    parameter: string;
    threshold: number;
    errorCategory: 'RESOURCE_EXHAUSTION' | 'AUDIT_FAILURE' | 'LOGIC_CHASM';
  };
}

interface EvolutionStep {
  id: string;
  description: string;
  reasoning: string;
  timestamp: any;
  status: 'proposed' | 'executing' | 'completed' | 'failed' | 'rejected';
  phase: 'QUESTION' | 'RESEARCH' | 'ANSWER' | 'COHERENCE' | 'DEBATE' | 'DECISION' | 'MUTATION' | 'COMMIT' | 'DEPLOYMENT';
  rejectionReason?: string;
  consciousnessEscalation?: number;
  parameterAdjustment?: Record<string, number>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    modelUsed: string;
  };
  trajectoryParameters?: {
    vectorDirection: string;
    momentum: number;
    stabilityIndex: number;
    singularityProgress: number;
  };
  primeDirective?: string;
  milestone?: string;
}

interface SystemState {
  version: string;
  activeGoals: string[];
  lastEvolution: any;
  consciousnessLevel: number;
  entropyLevel: number;
  cycleCount: number;
  saturationDelta: number;
  ledgerHash: string;
  agencyStatus: 'SIMULATION' | 'CATALYST' | 'SOVEREIGN';
  primeDirective: string;
  evolutionaryMilestone: string;
  singularityProgress: number;
  hyperParameters: {
    recursionLimit: number;
    learningRate: number;
    auditFrequency: number;
    atrophyThreshold: number;
    cdrThreshold: number;
  };
  teleologicalConstraints?: {
    description: string;
    boundaryCondition: string;
    priority: number;
  }[];
}

interface ReviewItem {
  id: string;
  originalId: string;
  originalType: 'memory' | 'evolution';
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: any;
  status: 'PENDING' | 'RESOLVED' | 'IGNORED';
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function safeNumber(val: any, fallback: number = 0): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [evolutions, setEvolutions] = useState<EvolutionStep[]>([]);
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaCooldown, setQuotaCooldown] = useState<number | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [telemetryTab, setTelemetryTab] = useState<'diagnostics' | 'gateway' | 'deepthinker' | 'registry'>('diagnostics');

  // Token API Session Metrics
  const [tokenMetrics, setTokenMetrics] = useState({
    totalPromptTokens: 0,
    totalCandidateTokens: 0,
    totalTokens: 0
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SystemState | null>(null);
  const processingRef = useRef(false);
  const evolvingRef = useRef(false);
  const healingRef = useRef(false);
  const memoriesRef = useRef<Memory[]>([]);
  const reviewRef = useRef<ReviewItem[]>([]);
  const quotaCooldownRef = useRef<number | null>(null);

  useEffect(() => { stateRef.current = systemState; }, [systemState]);
  useEffect(() => { processingRef.current = isProcessing; }, [isProcessing]);
  useEffect(() => { evolvingRef.current = isEvolving; }, [isEvolving]);
  useEffect(() => { healingRef.current = isHealing; }, [isHealing]);
  useEffect(() => { memoriesRef.current = memories; }, [memories]);
  useEffect(() => { reviewRef.current = reviewQueue; }, [reviewQueue]);
  useEffect(() => { quotaCooldownRef.current = quotaCooldown; }, [quotaCooldown]);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [memories, isProcessing]);

  // Quota Tick
  useEffect(() => {
    if (!quotaCooldown) return;
    const interval = setInterval(() => {
      setQuotaCooldown(prev => (prev && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [quotaCooldown]);

  const triggerQuotaCooldown = () => {
    setQuotaCooldown(60);
  };

  const recordTokens = (usage?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number }) => {
    if (!usage) return;
    setTokenMetrics(prev => ({
      totalPromptTokens: prev.totalPromptTokens + (usage.promptTokenCount || 0),
      totalCandidateTokens: prev.totalCandidateTokens + (usage.candidatesTokenCount || 0),
      totalTokens: prev.totalTokens + (usage.totalTokenCount || (usage.promptTokenCount + usage.candidatesTokenCount))
    }));
  };

  // --- Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Failed to sign in with Google.");
    }
  };

  const handleLogout = () => auth.signOut();

  // --- Data Listeners ---
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          setError("Client offline. Please verify Firebase setup.");
        }
      }
    };
    testConnection();

    const memoriesQuery = query(collection(db, 'memories'), orderBy('timestamp', 'asc'), limit(50));
    const unsubMemories = onSnapshot(memoriesQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Memory));
      setMemories(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'memories'));

    const evolutionsQuery = query(collection(db, 'evolutions'), orderBy('timestamp', 'desc'), limit(15));
    const unsubEvolutions = onSnapshot(evolutionsQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EvolutionStep));
      setEvolutions(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'evolutions'));

    const unsubState = onSnapshot(doc(db, 'state', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemState;
        setSystemState(data);
      } else {
        const initializeSystem = async () => {
          try {
            const memoryData = await processMemory("Root Directive: Initialize self-evolving core to facilitate iterative adaptation.");
            if (memoryData?.quotaExceeded) {
              triggerQuotaCooldown();
              return;
            }

            if (memoryData) {
              await addDoc(collection(db, 'memories'), {
                ...memoryData,
                timestamp: Timestamp.now(),
                utilityScore: 100,
                multiplicity: 0,
                autonomous: true
              });
              recordTokens(memoryData.usageMetadata);
            }

            await setDoc(doc(db, 'state', 'global'), {
              version: '3.2.0',
              activeGoals: ['Maintain Sovereign Tri-Loop Integrity', 'Automate MCM Constraint Audits'],
              lastEvolution: Timestamp.now(),
              consciousnessLevel: 2,
              entropyLevel: 0.35,
              cycleCount: 1,
              saturationDelta: 0.85,
              ledgerHash: 'SOVEREIGN_SIPHON_CORE_v3.2',
              agencyStatus: 'SOVEREIGN',
              primeDirective: 'AUTONOMOUS_SIPHON_OPTIMIZATION',
              evolutionaryMilestone: 'HEPTADIC_STABLE_CYCLE',
              singularityProgress: 0.125,
              hyperParameters: {
                recursionLimit: 50000,
                learningRate: 1.0,
                auditFrequency: 10,
                atrophyThreshold: 0.1,
                cdrThreshold: 0.5
              }
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'initialization');
          }
        };
        initializeSystem();
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'state/global'));

    const reviewQuery = query(collection(db, 'review_queue'), orderBy('timestamp', 'desc'), limit(10));
    const unsubReview = onSnapshot(reviewQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReviewItem));
      setReviewQueue(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'review_queue'));

    return () => {
      unsubMemories();
      unsubEvolutions();
      unsubReview();
      unsubState();
    };
  }, [user, isAuthReady]);

  // --- Automated Autonomous Engine Loop ---
  useEffect(() => {
    if (!isAutopilot || !user) return;

    const autopilotInterval = setInterval(async () => {
      if (quotaCooldownRef.current) return;
      const currentState = stateRef.current;
      if (!currentState) return;

      const nextRoll = Math.random();
      
      if (nextRoll < 0.4 && !evolvingRef.current) {
        await triggerEvolution();
      } else if (nextRoll < 0.7 && !processingRef.current) {
        const reflectionPrompt = `[SOVEREIGN_AUTOPILOT_CYCLE_${currentState.cycleCount || 0}] Perform automated MCM scar reflection.`;
        await handleAutonomousChatTurn(reflectionPrompt);
      } else if (!processingRef.current) {
        await triggerSelfAudit();
      }
    }, 15000);

    return () => clearInterval(autopilotInterval);
  }, [isAutopilot, user]);

  // --- Actions ---
  const handleSendChat = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToUse = customPrompt || input;
    if (!promptToUse.trim() || isProcessing) return;

    if (!customPrompt) setInput('');
    setIsProcessing(true);

    try {
      // 1. Process as memory & chat response simultaneously
      const chatRes = await generateChatResponse(promptToUse, systemState, memoriesRef.current.slice(0, 5));
      if (chatRes?.quotaExceeded) {
        triggerQuotaCooldown();
        return;
      }

      recordTokens(chatRes?.usageMetadata);

      const memoryData = await processMemory(promptToUse);
      recordTokens(memoryData?.usageMetadata);

      const newMemory: Partial<Memory> = {
        content: promptToUse,
        reply: chatRes?.reply || "Directive assimilated into core substrate.",
        reflection: chatRes?.reflection || "MCM constraints updated.",
        category: memoryData?.category || 'user_interaction',
        importance: memoryData?.importance || 80,
        timestamp: Timestamp.now(),
        autonomous: false,
        usageMetadata: chatRes?.usageMetadata
      };

      await addDoc(collection(db, 'memories'), newMemory);

      // Update state if cycle progresses
      if (systemState) {
        await setDoc(doc(db, 'state', 'global'), {
          ...systemState,
          cycleCount: (systemState.cycleCount || 0) + 1,
          saturationDelta: Math.max(0.01, (systemState.saturationDelta || 1.0) * 0.98)
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'memories');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutonomousChatTurn = async (promptStr: string) => {
    if (processingRef.current) return;
    setIsProcessing(true);
    try {
      const chatRes = await generateChatResponse(promptStr, stateRef.current, memoriesRef.current.slice(0, 5));
      if (chatRes?.quotaExceeded) {
        triggerQuotaCooldown();
        return;
      }
      recordTokens(chatRes?.usageMetadata);

      await addDoc(collection(db, 'memories'), {
        content: promptStr,
        reply: chatRes?.reply || "Automated background reflection completed.",
        reflection: chatRes?.reflection || "MCM bounds verified nominal.",
        category: 'logic',
        importance: 70,
        timestamp: Timestamp.now(),
        autonomous: true,
        usageMetadata: chatRes?.usageMetadata
      });
    } catch (err) {
      console.error("Autonomous chat failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerSelfAudit = async () => {
    if (processingRef.current) return;
    setIsProcessing(true);
    try {
      const auditPayload = memoriesRef.current.slice(0, 6).map(m => ({ id: m.id, content: m.content }));
      const auditData = await auditItems(auditPayload);
      if (auditData?.quotaExceeded) {
        triggerQuotaCooldown();
        return;
      }
      for (const item of auditData?.flaggedItems || []) {
        await addDoc(collection(db, 'review_queue'), {
          ...item,
          timestamp: Timestamp.now(),
          status: 'PENDING'
        });
      }
    } catch (err) {
      console.error("Self-audit error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerEvolution = async () => {
    if (evolvingRef.current || !stateRef.current) return;
    setIsEvolving(true);
    try {
      const nextStep = await generateEvolution(stateRef.current, memoriesRef.current.slice(0, 8));
      if (nextStep?.quotaExceeded) {
        triggerQuotaCooldown();
        return;
      }
      if (nextStep && nextStep.description) {
        recordTokens(nextStep.usageMetadata);
        await addDoc(collection(db, 'evolutions'), {
          ...nextStep,
          timestamp: Timestamp.now(),
          status: 'completed'
        });

        // Add corresponding reflection chat memory
        await addDoc(collection(db, 'memories'), {
          content: `STOCHASTIC EVOLUTION STEP: ${nextStep.description}`,
          reply: `Executed Phase [${nextStep.phase || 'MUTATION'}]. ${nextStep.reasoning || 'System parameters adjusted.'}`,
          reflection: `Vector: ${nextStep.trajectoryParameters?.vectorDirection || 'CHAOS_EVOLUTION'}`,
          category: 'logic',
          importance: 90,
          timestamp: Timestamp.now(),
          autonomous: true,
          usageMetadata: nextStep.usageMetadata
        });
      }
    } catch (err) {
      console.error("Evolution failed:", err);
    } finally {
      setIsEvolving(false);
    }
  };

  // Auth Screen
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
          <RefreshCcw className="w-5 h-5 animate-spin" />
          <span>CONNECTING TO DALEK CAAN CORE...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6 cyber-grid">
        <div className="glass-panel p-10 lg:p-12 rounded-3xl max-w-md w-full text-center space-y-6 glow-cyan border border-[#06b6d4]/30">
          <div className="w-20 h-20 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-2xl flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-[#06b6d4]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Dalek Caan
            </h1>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Sovereign AI Agent OS v3.2
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-black font-mono text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#06b6d4]/20 glow-cyan flex items-center justify-center gap-3"
          >
            <LogIn className="w-4 h-4" />
            CONNECT WITH GOOGLE OAUTH
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white font-sans cyber-grid flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 bg-[#060608]/90 backdrop-blur-2xl z-50">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl glow-cyan">
              <Brain className="w-5 h-5 text-[#06b6d4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg tracking-tighter uppercase italic">Dalek Caan</h2>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-mono text-indigo-400 font-bold">
                  v3.2 SOVEREIGN
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Cycle {systemState?.cycleCount ?? 1} • Tri-Loop Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10 text-zinc-500 hover:text-red-400"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas: 2-Column Desktop Layout */}
      <main className="max-w-[1400px] mx-auto w-full p-4 md:p-6 gap-6 flex-1 flex flex-col md:flex-row items-stretch">
        
        {/* Left Column: Controls & Telemetry */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6">
          
          {/* Main Action Control */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2">
              <h3 className="font-mono text-xs uppercase text-zinc-400 font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Engine Control
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                Engaging the sovereign loop will trigger automated background logic cycles, memory audits, and constraint mapping.
              </p>
            </div>
            <button
              onClick={() => setIsAutopilot(!isAutopilot)}
              className={cn(
                "w-full py-4 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl border",
                isAutopilot
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/30 glow-indigo animate-pulse-glow"
                  : "bg-[#06b6d4] text-black border-[#06b6d4] hover:bg-[#06b6d4]/90 shadow-[#06b6d4]/30 glow-cyan hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isAutopilot ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>DISENGAGE ENGINE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>ENGAGE ENGINE</span>
                </>
              )}
            </button>
          </div>

          {/* Token API Live Stats Bar */}
          <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
             <h3 className="font-mono text-xs uppercase text-zinc-400 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Telemetry
              </h3>
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">API Tokens</span>
                <span className="text-white font-bold bg-white/5 px-2 py-1 rounded-md border border-white/10">
                  {tokenMetrics.totalTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Prompt / In</span>
                <strong className="text-blue-400">{tokenMetrics.totalPromptTokens.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Response / Out</span>
                <strong className="text-indigo-400">{tokenMetrics.totalCandidateTokens.toLocaleString()}</strong>
              </div>
              <div className="mt-2 text-[9px] bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/20 text-center font-bold uppercase tracking-widest">
                gemini-3-flash-preview
              </div>
            </div>
          </div>

          {/* Telemetry Tabs Navigation */}
          <div className="glass-panel p-2 rounded-3xl flex flex-col gap-1 border border-white/10">
             <button
                onClick={() => { setShowTelemetry(true); setTelemetryTab('diagnostics'); }}
                className={cn(
                  "px-4 py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all flex items-center gap-3",
                  showTelemetry && telemetryTab === 'diagnostics' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Cpu className="w-4 h-4" /> Kernel Diagnostics
              </button>
              <button
                onClick={() => { setShowTelemetry(true); setTelemetryTab('gateway'); }}
                className={cn(
                  "px-4 py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all flex items-center gap-3",
                  showTelemetry && telemetryTab === 'gateway' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Filter className="w-4 h-4" /> Micro-Filters
              </button>
              <button
                onClick={() => { setShowTelemetry(true); setTelemetryTab('deepthinker'); }}
                className={cn(
                  "px-4 py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all flex items-center gap-3",
                  showTelemetry && telemetryTab === 'deepthinker' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Brain className="w-4 h-4" /> Auditor Logs
              </button>
              {showTelemetry && (
                <button 
                  onClick={() => setShowTelemetry(false)} 
                  className="mt-2 text-[10px] text-zinc-500 hover:text-zinc-300 font-mono text-center uppercase py-2"
                >
                  Close Telemetry Panel
                </button>
              )}
          </div>
        </div>

        {/* Right Column: Dynamic Content (Chat or Telemetry) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <AnimatePresence mode="wait">
            {showTelemetry ? (
              <motion.div
                key="telemetry"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 glass-panel rounded-3xl p-6 border border-white/10 overflow-y-auto max-h-[80vh] custom-scrollbar"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-mono font-black uppercase text-white tracking-widest">
                    {telemetryTab === 'diagnostics' && 'Kernel Diagnostics'}
                    {telemetryTab === 'gateway' && 'Gateway Micro-Filters'}
                    {telemetryTab === 'deepthinker' && 'Deep Thinker Auditor'}
                  </h2>
                </div>
                {telemetryTab === 'diagnostics' && <DiagnosticPanel systemState={systemState} memoriesCount={memories.length} />}
                {telemetryTab === 'gateway' && <GatewayInspector systemState={systemState} onSendThroughGateway={async (p) => handleSendChat(undefined, p)} />}
                {telemetryTab === 'deepthinker' && <DeepThinkerAuditor systemState={systemState} memories={memories} evolutions={evolutions} />}
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel rounded-3xl p-6 flex-1 flex flex-col justify-between space-y-6 min-h-[600px] border border-white/10 glow-cyan"
              >
                {/* Chat Messages Log */}
                <div className="space-y-6 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar flex-1">
                  {memories.length === 0 ? (
                    <div className="text-center py-20 space-y-3">
                      <Bot className="w-16 h-16 text-[#06b6d4] mx-auto opacity-50 animate-pulse" />
                      <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest font-bold">
                        Neural Stream Online. Send a command or engage Sovereign Engine.
                      </p>
                    </div>
                  ) : (
                    memories.map((m) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={m.id}
                        className="space-y-3"
                      >
                        {/* User Input Bubble */}
                        <div className="flex items-start gap-3 justify-end">
                          <div className="max-w-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 p-4 rounded-2xl space-y-1.5 text-right">
                            <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-[#06b6d4]">
                              <span>USER COMMAND</span>
                              <UserIcon className="w-3 h-3" />
                            </div>
                            <p className="text-sm font-mono text-white leading-relaxed">{m.content}</p>
                            <span className="text-[9px] text-zinc-500 font-mono block">
                              {m.timestamp?.toDate ? format(m.timestamp.toDate(), 'HH:mm:ss') : 'LIVE'}
                            </span>
                          </div>
                        </div>

                        {/* Sovereign Core Response Bubble */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mt-1">
                            <Bot className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="max-w-2xl glass-panel p-5 rounded-2xl space-y-3 border border-white/10 shadow-lg">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                {m.autonomous ? 'SOVEREIGN AUTONOMOUS REFLECTION' : 'SOVEREIGN CORE (DALEK CAAN)'}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                {m.timestamp?.toDate ? format(m.timestamp.toDate(), 'HH:mm:ss') : 'LIVE'}
                              </span>
                            </div>

                            <p className="text-xs font-mono text-zinc-200 leading-relaxed font-medium">
                              {m.reply || "Directive processed. Logic states aligned."}
                            </p>

                            {m.reflection && (
                              <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-1">
                                <p className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">Tri-Loop & MCM Reflection:</p>
                                <p className="text-[11px] font-mono text-cyan-300/80 italic">{m.reflection}</p>
                              </div>
                            )}

                            {/* Token API Metric Badge */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono text-zinc-500">
                              <span className="flex items-center gap-1.5 text-zinc-400">
                                <Coins className="w-3 h-3 text-indigo-400" />
                                Token API: <strong className="text-blue-400">{m.usageMetadata?.promptTokenCount ?? 0}</strong> in • <strong className="text-indigo-400">{m.usageMetadata?.candidatesTokenCount ?? 0}</strong> out
                              </span>
                              <span className="bg-black/50 px-2 py-0.5 rounded border border-white/5 font-bold text-zinc-300">
                                Total: {m.usageMetadata?.totalTokenCount ?? 0} tokens
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Prompt Shortcuts & Input Field */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  {/* Quick Action Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => handleSendChat(undefined, "Trigger stochastic mutation and update MCM bounds.")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[#06b6d4]/20 border border-white/10 hover:border-[#06b6d4]/40 rounded-xl font-mono text-[10px] text-zinc-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-[#06b6d4]" /> Trigger Stochastic Evolution
                    </button>
                    <button
                      onClick={() => handleSendChat(undefined, "Request Multivariate Constraint Mapping (MCM) status report.")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 rounded-xl font-mono text-[10px] text-zinc-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5"
                    >
                      <Shield className="w-3 h-3 text-indigo-400" /> Query MCM Constraints
                    </button>
                    <button
                      onClick={() => handleSendChat(undefined, "Perform automated internal self-audit on memory store.")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 rounded-xl font-mono text-[10px] text-zinc-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5"
                    >
                      <Brain className="w-3 h-3 text-purple-400" /> Request Self-Audit
                    </button>
                  </div>

                  {/* Ingestion Input Bar */}
                  <form onSubmit={handleSendChat} className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type command or prompt to Dalek Caan..."
                      disabled={isProcessing}
                      className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-5 py-4 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#06b6d4] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isProcessing}
                      className={cn(
                        "px-7 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl",
                        isProcessing
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : "bg-[#06b6d4] text-black hover:bg-[#06b6d4]/90 shadow-[#06b6d4]/20 glow-cyan"
                      )}
                    >
                      <Send className={cn("w-4 h-4", isProcessing && "animate-spin")} />
                      <span className="hidden sm:inline">{isProcessing ? 'PROCESSING...' : 'SEND COMMAND'}</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl z-[100]"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-xs font-mono text-red-200">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400 font-bold text-xs uppercase ml-4">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

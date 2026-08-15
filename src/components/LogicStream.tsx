/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/LogicStream.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal as TerminalIcon, Shield, Activity } from 'lucide-react';

interface LogicStreamProps {
  active: boolean;
  cycleCount: number;
}

const LOG_TEMPLATES = [
  "SIPHON: EXTRACTING_DNA_NODE [{node}]",
  "PROTOCOL: APPLYING_MCM_CONSTRAINT_V5.2",
  "HUXLEY: TRI_LOOP_SYNC_DELTA: {delta}",
  "AUDIT: CONSISTENCY_CHECK_SATURATED",
  "REPAIR: REPLACING_ATROPHY_NODE_{id}",
  "STOCHASTIC: INJECTING_CHAOS_SEED_{seed}",
  "DALEK: REFINING_SIPHON_MANIFOLD",
  "EMG: LOGARITHMIC_DECAY_CALIBRATED",
  "ROCK: SATURATION_GUARD_ENGAGED",
  "SINGULARITY: HEPTADIC_SEQUENCE_STEP_{step}"
];

const NODES = ["Huxley", "GROG", "EMG-CORE", "T-ROCK", "Balanced_Auditor"];

export const LogicStream: React.FC<LogicStreamProps> = ({ active, cycleCount }) => {
  const [logs, setLogs] = useState<{ id: string; text: string; type: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const addLog = () => {
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const node = NODES[Math.floor(Math.random() * NODES.length)];
      const text = template
        .replace('{node}', node)
        .replace('{delta}', (Math.random() * 0.01).toFixed(4))
        .replace('{id}', Math.random().toString(36).substring(7).toUpperCase())
        .replace('{seed}', Math.floor(Math.random() * 1000).toString())
        .replace('{step}', Math.floor(Math.random() * 7).toString());

      setLogs(prev => [...prev.slice(-20), { 
        id: Date.now().toString(), 
        text, 
        type: template.split(':')[0] 
      }]);
    };

    const interval = setInterval(addLog, 1500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-[9px] overflow-hidden flex flex-col h-48 group">
      <div className="flex justify-between items-center mb-3 text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3 h-3" />
          <span>Siphon Logic Stream</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className={cn(
                "w-12 shrink-0",
                log.type === 'SIPHON' && "text-blue-400",
                log.type === 'PROTOCOL' && "text-emerald-400",
                log.type === 'HUXLEY' && "text-amber-400",
                log.type === 'AUDIT' && "text-red-400",
                "opacity-50"
              )}>
                [{log.type}]
              </span>
              <span className="text-zinc-400">{log.text.split(':')[1] || log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!active && (
          <div className="h-full flex items-center justify-center text-zinc-700 italic">
            ENGINE_OFFLINE: WAITING_FOR_SOVEREIGN_LINK
          </div>
        )}
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

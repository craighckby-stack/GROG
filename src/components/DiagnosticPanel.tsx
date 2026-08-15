/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/DiagnosticPanel.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, RefreshCcw, Cpu, HardDrive, Zap, Lock, Terminal, Activity } from 'lucide-react';
import { runSystemDiagnostics, DiagnosticReport } from '../lib/diagnostic-engine';
import { cn } from '../lib/utils';

interface DiagnosticPanelProps {
  systemState: any;
  memoriesCount: number;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ systemState, memoriesCount }) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunDiagnostics = async () => {
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 600));
    const diagReport = await runSystemDiagnostics(systemState, memoriesCount);
    setReport(diagReport);
    setIsRunning(false);
  };

  React.useEffect(() => {
    handleRunDiagnostics();
  }, [systemState?.cycleCount, memoriesCount]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 lg:p-10 relative overflow-hidden glow-emerald">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Cpu className="w-48 h-48 text-emerald-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-full uppercase font-bold tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI AGENT OS KERNEL HABITAT
              </span>
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">CONTROLLER: DALEK CAAN V3.2</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter">
              Kernel Diagnostic Engine
            </h3>
            <p className="text-zinc-400 text-xs font-mono max-w-xl leading-relaxed">
              Fail-Fast Kernel Integrity Contract. Pre-flight diagnostic suites audit environment loaders, micro-filter gateways, flat-file memory, and MCM saturation guards.
            </p>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunning}
            className={cn(
              "px-7 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 shadow-xl self-start md:self-center",
              isRunning
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/20 glow-emerald"
            )}
          >
            <RefreshCcw className={cn("w-4 h-4", isRunning && "animate-spin")} />
            {isRunning ? 'EXECUTING SUITE...' : 'RUN DIAGNOSTIC SUITE'}
          </button>
        </div>
      </div>

      {/* Report Status Grid */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
            <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-widest font-semibold">Kernel Health</p>
            <div className="flex items-center gap-2.5">
              {report.status === 'HEALTHY' && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
              {report.status === 'DEGRADED' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
              {report.status === 'COMPROMISED' && <XCircle className="w-6 h-6 text-red-500" />}
              <span className={cn(
                "text-2xl font-black italic uppercase font-mono",
                report.status === 'HEALTHY' ? "text-emerald-400" : report.status === 'DEGRADED' ? "text-amber-400" : "text-red-500"
              )}>
                {report.status}
              </span>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
            <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-widest font-semibold">Checks Passed</p>
            <p className="text-2xl font-black italic text-white font-mono">
              {report.passedChecks} / {report.totalChecks} <span className="text-xs text-zinc-500 font-normal">PASSED</span>
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
            <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-widest font-semibold">Gateway Pipeline</p>
            <p className="text-xl font-black italic text-blue-400 font-mono uppercase pt-0.5">
              {report.habitatInfo.gatewayStatus}
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
            <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-widest font-semibold">Substrate Mode</p>
            <p className="text-xs font-bold text-zinc-200 font-mono uppercase truncate pt-1">
              {report.habitatInfo.memorySyncMode}
            </p>
          </div>
        </div>
      )}

      {/* Individual Diagnostic Checks List */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 space-y-5">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono uppercase text-zinc-300 tracking-widest font-bold">Diagnostic Checks Matrix</h4>
          </div>
          {report && (
            <span className="text-[10px] font-mono text-zinc-500">
              LAST RUN: {new Date(report.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {report?.checks.map((chk) => (
            <div
              key={chk.id}
              className={cn(
                "p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                chk.status === 'HEALTHY' ? "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40" :
                chk.status === 'WARN' ? "bg-amber-950/10 border-amber-500/20 hover:border-amber-500/40" :
                "bg-red-950/10 border-red-500/20 hover:border-red-500/40"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[8px] font-mono uppercase px-2.5 py-0.5 rounded-md font-bold tracking-wider",
                    chk.status === 'HEALTHY' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    chk.status === 'WARN' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-red-500/20 text-red-400 border border-red-500/30"
                  )}>
                    [{chk.category}] {chk.status}
                  </span>
                  <h5 className="text-sm font-bold text-white font-mono">{chk.name}</h5>
                </div>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed pl-1">{chk.message}</p>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center font-mono text-[10px] text-zinc-500">
                <span className="bg-black/50 px-2.5 py-1 rounded-lg border border-white/5">{chk.latencyMs}ms</span>
                {chk.details && (
                  <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 space-x-2 text-zinc-300">
                    {Object.entries(chk.details).slice(0, 2).map(([k, v]) => (
                      <span key={k}>
                        <span className="text-zinc-500">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

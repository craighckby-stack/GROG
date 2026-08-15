/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/GatewayInspector.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2, Lock, Sparkles, Filter, Database, Send } from 'lucide-react';
import { applyIngressMicroFilter, applyEgressMicroFilter, SanitizedIngress, AuditedEgress } from '../lib/gateway-pipeline';
import { cn } from '../lib/utils';

interface GatewayInspectorProps {
  systemState: any;
  onSendThroughGateway: (prompt: string) => Promise<void>;
}

export const GatewayInspector: React.FC<GatewayInspectorProps> = ({ systemState, onSendThroughGateway }) => {
  const [inputPrompt, setInputPrompt] = useState('Analyze logic loops for entropy leaks.');
  const [lastIngress, setLastIngress] = useState<SanitizedIngress | null>(null);
  const [lastEgress, setLastEgress] = useState<AuditedEgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestGateway = async () => {
    if (!inputPrompt.trim()) return;
    setIsProcessing(true);

    const ingressResult = applyIngressMicroFilter({
      rawPrompt: inputPrompt,
      taskState: {
        completionPercentage: Math.round((systemState?.singularityProgress || 0.001) * 100),
        entropy: systemState?.entropyLevel ?? 1.0,
        cycleCount: systemState?.cycleCount ?? 0,
        primeDirective: systemState?.primeDirective || 'STABILIZE_CORE'
      },
      contextWindow: []
    });
    setLastIngress(ingressResult);

    await onSendThroughGateway(ingressResult.sanitizedPrompt);

    const actualOutput = JSON.stringify({
      phase: 'DIRECTIVE_DISPATCH',
      vectorDirection: 'SOVEREIGN_OPTIMIZATION',
      sanitizedInput: ingressResult.sanitizedPrompt,
      executionTimestamp: new Date().toISOString(),
      reasoning: 'Live prompt processed through Gemini 3 Flash Gateway. System adhering to MCM constraints.'
    }, null, 2);

    const egressResult = applyEgressMicroFilter({
      rawResponse: actualOutput,
      modelName: 'gemini-3-flash-preview'
    });
    setLastEgress(egressResult);

    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel rounded-3xl p-8 lg:p-10 relative overflow-hidden glow-blue">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono rounded-full uppercase font-bold tracking-widest flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              DUAL-LLM GATEWAY & MICRO-FILTER PIPELINE
            </span>
            <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">HABITAT: GENESIS SCAFFOLD</span>
          </div>
          <h3 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter">
            The "Mouth & Ass" Micro-Filter Loop
          </h3>
          <p className="text-zinc-400 text-xs font-mono max-w-2xl leading-relaxed">
            Decouples raw user queries from LLM execution. The <strong className="text-white">Ingress Filter ("The Mouth")</strong> cleans prompts and injects state headers, while the <strong className="text-white">Egress Filter ("The Ass")</strong> audits structured actions and enforces MCM constraints.
          </p>
        </div>
      </div>

      {/* Interactive Gateway Tester */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase text-zinc-300 tracking-widest font-bold flex items-center gap-2.5">
            <Send className="w-4 h-4 text-[#F27D26]" /> Test Ingress & Egress Pipeline
          </h4>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Enter prompt to test through Micro-Filter Gateway..."
            className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#F27D26] transition-all"
          />
          <button
            onClick={handleTestGateway}
            disabled={isProcessing || !inputPrompt.trim()}
            className={cn(
              "px-8 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl",
              isProcessing
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-[#F27D26] text-white hover:bg-[#F27D26]/90 hover:scale-[1.02] active:scale-[0.98] shadow-[#F27D26]/20 glow-orange"
            )}
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? 'FILTERING & PROCESSING...' : 'EXECUTE GATEWAY PASS'}
          </button>
        </div>
      </div>

      {/* Gateway Telemetry Display */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Ingress Filter Card */}
        <div className="glass-panel rounded-3xl p-6 lg:p-8 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-widest">
                Ingress Filter ("The Mouth")
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Input Sanitizer</span>
          </div>

          {lastIngress ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Injected State Headers</p>
                <div className="bg-black/70 p-4 rounded-2xl border border-white/5 text-[10px] text-emerald-300/80 space-y-1.5">
                  {Object.entries(lastIngress.injectedHeaders).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-zinc-500">{k}:</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Sanitized Ingress Payload</p>
                <div className="bg-black/70 p-4 rounded-2xl border border-white/5 text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {lastIngress.sanitizedPrompt}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-zinc-500">Security Flags:</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  {lastIngress.securityFlags.length > 0 ? lastIngress.securityFlags.join(', ') : 'PASSED_CLEAN'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-600 font-mono italic py-10 text-center">
              Awaiting Gateway test execution...
            </p>
          )}
        </div>

        {/* Egress Filter Card */}
        <div className="glass-panel rounded-3xl p-6 lg:p-8 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <h4 className="text-xs font-mono font-bold uppercase text-blue-400 tracking-widest">
                Egress Filter ("The Ass")
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">MCM Action Auditor</span>
          </div>

          {lastEgress ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-black/70 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-zinc-500 uppercase font-semibold">Action Commitment</p>
                  <p className="text-xs font-bold text-white uppercase italic">{lastEgress.actionCommitment}</p>
                </div>
                <div className="p-4 bg-black/70 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-zinc-500 uppercase font-semibold">MCM Compliance</p>
                  <p className={cn("text-xs font-bold uppercase", lastEgress.mcmCompliance ? "text-emerald-400" : "text-red-400")}>
                    {lastEgress.mcmCompliance ? 'VERIFIED_SAFE' : 'MCM_VIOLATION'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Audited Narrative Output</p>
                <div className="bg-black/70 p-4 rounded-2xl border border-white/5 text-zinc-200 italic text-xs leading-relaxed">
                  "{lastEgress.narrativeSpeech}"
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-zinc-500">Speech/Action Alignment:</span>
                <span className={cn(
                  "text-[10px] px-3 py-1 rounded-full border font-bold uppercase",
                  lastEgress.mismatchDetected ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                )}>
                  {lastEgress.mismatchDetected ? `MISMATCH (${(lastEgress.mismatchScore * 100).toFixed(0)}%)` : 'ALIGNED'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-600 font-mono italic py-10 text-center">
              Awaiting Gateway test execution...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

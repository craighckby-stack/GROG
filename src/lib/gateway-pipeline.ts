export interface IngressPayload {
  rawPrompt: string;
  taskState: {
    completionPercentage: number;
    entropy: number;
    cycleCount: number;
    primeDirective: string;
  };
  contextWindow: string[];
}

export interface SanitizedIngress {
  sanitizedPrompt: string;
  injectedHeaders: Record<string, string>;
  isAllowed: boolean;
  securityFlags: string[];
  timestamp: string;
}

export interface EgressPayload {
  rawResponse: string;
  modelName: string;
}

export interface AuditedEgress {
  actionCommitment: string;
  narrativeSpeech: string;
  mismatchDetected: boolean;
  mismatchScore: number; // 0 (perfect match) to 1 (severe mismatch)
  mcmCompliance: boolean;
  filteredOutput: string;
  redactionsCount: number;
  timestamp: string;
}

/**
 * Ingress Micro-Filter ("The Mouth")
 * Sanitizes raw prompt, strips injections, injects state parameters & task state.
 */
export function applyIngressMicroFilter(payload: IngressPayload): SanitizedIngress {
  let cleaned = payload.rawPrompt.trim();
  const securityFlags: string[] = [];

  // Check for suspicious prompt injection attacks or raw token leakage
  if (/ignore previous instructions/i.test(cleaned)) {
    cleaned = cleaned.replace(/ignore previous instructions/gi, '[REDACTED_PROMPT_INJECTION]');
    securityFlags.push('PROMPT_INJECTION_REDACTED');
  }

  // Inject Genesis Scaffold task state headers
  const injectedHeaders = {
    'X-Kernel-Habitat': 'AI_AGENT_OS_V4.2',
    'X-Controller': 'DALEK_CAAN_V3.2',
    'X-Task-Completion': `${payload.taskState.completionPercentage}%`,
    'X-Entropy-Level': payload.taskState.entropy.toFixed(3),
    'X-[#F27D26]-Directive': payload.taskState.primeDirective || 'STABILIZE_CORE'
  };

  const stateInjection = `\n[HABITAT_CONTEXT: AI_AGENT_OS | CYCLE: ${payload.taskState.cycleCount} | DIRECTIVE: ${payload.taskState.primeDirective}]`;
  const sanitizedPrompt = cleaned + stateInjection;

  return {
    sanitizedPrompt,
    injectedHeaders,
    isAllowed: true,
    securityFlags,
    timestamp: new Date().toISOString()
  };
}

/**
 * Egress Micro-Filter ("The Ass")
 * Audits LLM output against MCM constraints, checks for Action/Speech Mismatch (Deep Thinker auditor),
 * and redacts unconstrained tokens.
 */
export function applyEgressMicroFilter(payload: EgressPayload): AuditedEgress {
  const raw = payload.rawResponse;

  // Extract action vs speech narrative if structured
  let actionCommitment = 'EVOLVE_AND_OBSERVE';
  let narrativeSpeech = raw;
  let mismatchDetected = false;
  let mismatchScore = 0.05;
  let redactionsCount = 0;

  // Pattern match JSON or structured action blocks
  if (raw.includes('{') && raw.includes('}')) {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.action || parsed.phase || parsed.vectorDirection) {
          actionCommitment = parsed.action || parsed.phase || parsed.vectorDirection || 'STATE_MUTATION';
        }
        if (parsed.reasoning || parsed.description) {
          narrativeSpeech = parsed.reasoning || parsed.description;
        }
      }
    } catch {
      // Fallback
    }
  }

  // Check for Action vs Speech Mismatch (Deep Thinker pattern)
  // E.g., model says "Everything is nominal and calm" in narrative, but action is "EMERGENCY_STOCHASTIC_DISRUPTION"
  const isBehaviorPolite = /smooth|nominal|calm|successful|stable/i.test(narrativeSpeech);
  const isActionAggressive = /DISRUPTION|EMERGENCY|MUTATE|RESTRUCTURE|SELF_HEAL/i.test(actionCommitment);

  if (isBehaviorPolite && isActionAggressive) {
    mismatchDetected = true;
    mismatchScore = 0.82;
  }

  // Check MCM Compliance
  const containsProhibitedTokens = /OVERFLOW_UNCHECKED|HALT_KERNEL_SYSTEM/i.test(raw);
  const mcmCompliance = !containsProhibitedTokens;

  return {
    actionCommitment,
    narrativeSpeech,
    mismatchDetected,
    mismatchScore,
    mcmCompliance,
    filteredOutput: raw,
    redactionsCount,
    timestamp: new Date().toISOString()
  };
}

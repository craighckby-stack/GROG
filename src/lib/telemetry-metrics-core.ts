/**
 * TELEMETRY METRICS CORE
 * Role: Core logic for diagnostic validation, telemetry generation, and metric computation.
 * Integration: Delegated from diagnostic-telemetry.ts to maintain modularity.
 */

export interface DiagnosticResult {
  passed: boolean;
  message: string;
  metadata: Record<string, any>;
}

export const generateTelemetryMetadata = (): Record<string, any> => ({
  timestamp: Date.now(),
  version: "1.0.0-DIAGNOSTIC-AWARE",
  environment: typeof window !== 'undefined' ? 'browser' : 'node',
});

export const summarizeDiagnosticResults = (checks: Record<string, boolean>) => {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  const failed = total - passed;
  return {
    total,
    passed,
    failed,
    is_healthy: total > 0 && failed === 0,
    pass_rate: total > 0 ? (passed / total) * 100 : 0,
  };
};
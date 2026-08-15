/**
 * SIPHON DIAGNOSTIC ENGINE
 * Role: Monitors and reports on repository siphoning health and performance.
 */

export interface DiagnosticResult {
  passed: boolean;
  duration_ms: number;
  error?: string;
}

export class SiphonDiagnosticEngine {
  private registry: Record<string, DiagnosticResult[]> = {};

  async track<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.log(name, { passed: true, duration_ms: duration });
      return result;
    } catch (e: any) {
      const duration = performance.now() - start;
      this.log(name, { passed: false, duration_ms: duration, error: e.message });
      throw e;
    }
  }

  private log(name: string, result: DiagnosticResult) {
    if (!this.registry[name]) this.registry[name] = [];
    this.registry[name].push(result);
  }

  getSummary() {
    return Object.entries(this.registry).map(([name, results]) => ({
      name,
      avg_ms: results.reduce((a, b) => a + b.duration_ms, 0) / results.length,
      success_rate: (results.filter(r => r.passed).length / results.length) * 100
    }));
  }
}
/**
 * SYSTEM DIAGNOSTIC RUNNER
 * Role: Executes the diagnostic suite to verify system health before application startup.
 */
import { runSystemDiagnostics } from '../src/lib/diagnostic-engine';

async function main() {
  console.log('--- Initiating System Diagnostic Suite ---');
  const report = await runSystemDiagnostics();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.is_healthy ? 0 : 1);
}

main().catch(console.error);
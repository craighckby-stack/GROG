/**
 * SYSTEM DIAGNOSTIC RUNNER
 * Role: Executes the system diagnostic suite and outputs a health report.
 * Integration: Triggered via 'npm run diagnostic:run'.
 */
import { runSystemDiagnostics } from '../src/lib/diagnostic-engine';

async function main() {
  console.log('--- Initiating System Diagnostics ---');
  const report = await runSystemDiagnostics();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.is_healthy ? 0 : 1);
}

main().catch(console.error);
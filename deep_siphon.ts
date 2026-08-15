/**
 * DEEP SIPHON ENGINE v2.1
 * Role: Orchestrates high-fidelity repository siphoning with diagnostic telemetry.
 * Integration: Utilizes SiphonDiagnosticEngine for real-time health monitoring.
 * Dependencies: src/lib/siphon-diagnostics.ts
 */

import fs from 'fs';
import { SiphonDiagnosticEngine } from './src/lib/siphon-diagnostics';

const diagnosticEngine = new SiphonDiagnosticEngine();

/**
 * Fetches the git tree for a specific repository branch.
 */
async function fetchTree(user: string, repo: string, sha: string) {
  return await diagnosticEngine.track(`fetchTree:${user}/${repo}`, async () => {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}/git/trees/${sha}?recursive=1`, {
      headers: { 
        'User-Agent': 'DARLEK-CANN-SIPHON-ENGINE',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tree || [];
  });
}

/**
 * Fetches raw file content from GitHub.
 */
async function fetchFile(user: string, repo: string, path: string) {
  return await diagnosticEngine.track(`fetchFile:${path}`, async () => {
    const response = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${path}`);
    if (!response.ok) return null;
    return await response.text();
  });
}

/**
 * Fetches repository branches.
 */
async function fetchBranches(user: string, repo: string) {
  return await diagnosticEngine.track(`fetchBranches:${user}/${repo}`, async () => {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}/branches`, {
      headers: { 'User-Agent': 'DARLEK-CANN-SIPHON-ENGINE' }
    });
    if (!response.ok) return [];
    return await response.json();
  });
}

/**
 * Main execution loop for repository siphoning.
 */
async function runSiphon() {
  const users = ['craighckby', 'craighckby-stack'];
  const repos = ['Huxley-Singularity-Loop', 'GROG-The-First-Learning-AGI', 'T', 'EMG-CORE', 'Balanced_Auditor_v5.2'];
  const registry: Record<string, any> = {};

  for (const user of users) {
    for (const repo of repos) {
      console.log(`[DIAGNOSTIC] Initiating siphon for: ${user}/${repo}`);
      const branches = await fetchBranches(user, repo);
      if (!Array.isArray(branches) || branches.length === 0) continue;
      
      registry[repo] = registry[repo] || {};
      
      for (const b of branches.slice(0, 5)) {
        const tree = await fetchTree(user, repo, b.name);
        const candidates = tree.filter((f: any) => 
          f.path.toLowerCase().endsWith('.md') || 
          f.path.toLowerCase().includes('engine') ||
          f.path.toLowerCase().includes('manifest')
        );

        for (const f of candidates) {
          const content = await fetchFile(user, repo, `${b.name}/${f.path}`);
          if (content && (content.includes('Architecture') || content.includes('Engine'))) {
             if (!registry[repo][b.name]) registry[repo][b.name] = [];
             registry[repo][b.name].push({ path: f.path, content: content.slice(0, 5000) });
             if (registry[repo][b.name].length > 3) break; 
          }
        }
      }
    }
  }
  
  fs.writeFileSync('./genetic_registry.json', JSON.stringify(registry, null, 2));
  console.log('[DIAGNOSTIC] Siphon Complete. Summary:', JSON.stringify(diagnosticEngine.getSummary(), null, 2));
}

// Execute with error boundary
runSiphon().catch((err) => {
  console.error('[CRITICAL] Siphon Engine Failure:', err);
  process.exit(1);
});
import fs from 'fs';

async function fetchTree(user, repo, sha) {
  const response = await fetch(`https://api.github.com/repos/${user}/${repo}/git/trees/${sha}?recursive=1`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.tree || [];
}

async function fetchFile(user, repo, path) {
  const response = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${path}`);
  if (!response.ok) return null;
  return await response.text();
}

async function fetchBranches(user, repo) {
  const response = await fetch(`https://api.github.com/repos/${user}/${repo}/branches`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!response.ok) {
    console.log(`      Error fetching branches for ${user}/${repo}: ${response.status}`);
    return [];
  }
  return await response.json();
}

async function runSiphon() {
  const users = ['craighckby', 'craighckby-stack'];
  const repos = [
    'Huxley-Singularity-Loop', 
    'GROG-The-First-Learning-AGI', 
    'T', 
    'EMG-CORE', 
    'Balanced_Auditor_v5.2'
  ];
  const registry = {};

  for (const user of users) {
    for (const repo of repos) {
      console.log(`Checking https://api.github.com/repos/${user}/${repo}...`);
      const branches = await fetchBranches(user, repo);
      if (!branches || branches.length === 0) continue;
      
      console.log(`Siphoning ${user}/${repo} (${branches.length} branches)...`);
      registry[repo] = registry[repo] || {};
      
      for (const b of branches.slice(0, 10)) {
        console.log(`  Scanning branch: ${b.name}`);
        const tree = await fetchTree(user, repo, b.name);
        
        const candidates = tree.filter(f => 
          f.path.toLowerCase().endsWith('.md') || 
          f.path.toLowerCase().includes('engine') ||
          f.path.toLowerCase().includes('manifest') ||
          f.path.toLowerCase().includes('logic')
        );

        for (const f of candidates) {
          const content = await fetchFile(user, repo, `${b.name}/${f.path}`);
          if (content && (content.includes('Architecture') || content.includes('logic') || content.includes('Engine') || content.includes('MCM') || content.includes('Chaos'))) {
             if (!registry[repo][b.name]) registry[repo][b.name] = [];
             registry[repo][b.name].push({ 
               path: f.path, 
               content: content.slice(0, 5000) 
             });
             if (registry[repo][b.name].length > 5) break; 
          }
        }
        if (Object.keys(registry[repo]).length > 10) break;
      }
    }
  }
  
  fs.writeFileSync('./genetic_registry.json', JSON.stringify(registry, null, 2));
  console.log('Siphon Complete. Genetic Registry compiled.');
}

runSiphon();

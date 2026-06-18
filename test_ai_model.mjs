
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3001';

async function runFullAnalysis() {
  console.log('--- Polystrukt AI Model Synthesis Audit ---');

  // 1. Start Server in background
  console.log('Building server process...');
  const serverPath = path.join(process.cwd(), 'server', 'server.mjs');
  const server = spawn('node', [serverPath], {
    env: { ...process.env, PORT: '3001', NODE_ENV: 'development' },
    stdio: 'inherit'
  });

  console.log('Waiting for server initialization (10s)...');
  await new Promise(r => setTimeout(r, 10000));

  try {
    // 2. Auth Login (using demo user defined in server.mjs)
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@polystrukt.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${await loginRes.text()}`);
    }
    
    const { token } = await loginRes.json();
    console.log('Authentication Protocol: SUCCESS.');

    // 3. Test with "Unique Prompts"
    const uniquePrompts = [
      "Generate a fuselage bulkhead for a high-altitude drone inspired by the internal structure of bird bones (trabecular bone). It must integrate with 4 longitudinal carbon fiber spars and provide mount points for avionics, while prioritizing extreme stiffness-to-weight ratio.",
      "Synthesize a non-Euclidean heat exchanger manifold that utilizes gyroid minimal surfaces for fluid-to-air cooling in a cryogenic environment. Material: Titanium Ti-6Al-4V."
    ];

    for (const prompt of uniquePrompts) {
      console.log(`\nINTELLIGENCE REQUEST: "${prompt}"`);
      
      const genRes = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!genRes.ok) {
        console.error('Synthesis initialization FAILED:', await genRes.text());
        continue;
      }

      const { jobId } = await genRes.json();
      console.log(`Job enqueued: ${jobId}. Polling synthesis core...`);

      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 40) {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`${BASE_URL}/api/generate/status/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const job = await statusRes.json();
        
        if (job.state === 'completed') {
          completed = true;
          console.log('\nSYNTHESIS COMPLETE.');
          auditModelOutput(job.result);
        } else if (job.state === 'failed') {
          completed = true;
          console.log(`\nCORE FAILURE: ${job.error}`);
        }
        attempts++;
      }
      if (!completed) console.log('\nTIMEOUT Error.');
    }

  } catch (err) {
    console.error('Audit crashed:', err);
  } finally {
    console.log('\nTerminating server process...');
    server.kill();
    process.exit(0);
  }
}

function auditModelOutput(result) {
  console.log('--- Model Logic Audit ---');
  console.log(`Engineering Logic: ${result.thought_process?.substring(0, 500)}...`);
  console.log(`Optimization: ${result.optimizationLogic}`);
  console.log(`Suggested Materials: ${result.suggestedMaterials?.join(', ')}`);
  
  const csg = result.proceduralSpec;
  const countNodes = (node) => {
    if (!node) return 0;
    let count = 1;
    if (node.children) node.children.forEach(c => count += countNodes(c));
    if (node.a) count += countNodes(node.a);
    if (node.b) count += countNodes(node.b);
    return count;
  };
  
  const nodeCount = countNodes(csg);
  console.log(`Geometry Nodes: ${nodeCount}`);
  
  // Complexity check
  if (nodeCount > 10) {
    console.log('VERDICT: High-Resolution synthesis detected. Model handled unique constraints well.');
  } else {
    console.log('VERDICT: Low-Resolution synthesis. Model struggled with organic complexity.');
  }

  // Cross-reference with prompt
  const analysis = result.analysis?.toLowerCase() || '';
  if (analysis.includes('bone') || analysis.includes('structural') || analysis.includes('stiffness')) {
    console.log('CONTEXT CHECK: Contextually accurate terminology used.');
  } else {
    console.log('CONTEXT CHECK: Warning - Generic terminology detected.');
  }
}

runFullAnalysis();

#!/usr/bin/env node

/**
 * Generate SHA256 hashes for inline scripts in index.html
 * Used for Content Security Policy (CSP) configuration
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_HTML_PATH = path.join(__dirname, '../src/frontend/index.html');

function generateSHA256Hash(content) {
  const hash = crypto.createHash('sha256');
  hash.update(content, 'utf8');
  return hash.digest('base64');
}

function extractInlineScripts(html) {
  const scripts = [];

  // Match inline script tags (not external ones with src attribute)
  // This regex captures script content between <script> and </script> tags
  // Excludes scripts with src attribute
  const scriptRegex = /<script(?![^>]*\ssrc=)(?:\s[^>]*)?>([^]*?)<\/script>/gi;

  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1];
    // Skip empty scripts
    if (scriptContent.trim()) {
      scripts.push(scriptContent);
    }
  }

  return scripts;
}

function main() {
  console.log('🔒 Generating CSP hashes for inline scripts...\n');

  // Read the HTML file
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error(`❌ Error: File not found at ${INDEX_HTML_PATH}`);
    process.exit(1);
  }

  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Extract inline scripts
  const scripts = extractInlineScripts(html);

  if (scripts.length === 0) {
    console.log('ℹ️  No inline scripts found in index.html');
    return;
  }

  console.log(`📝 Found ${scripts.length} inline script(s)\n`);

  // Generate hashes for each script
  const hashes = scripts.map((script, index) => {
    const hash = generateSHA256Hash(script);

    console.log(`Script #${index + 1}:`);
    console.log(`  Hash: sha256-${hash}`);
    console.log(`  Preview: ${script.trim().substring(0, 60)}...`);
    console.log('');

    return `'sha256-${hash}'`;
  });

  // Output CSP directive
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 CSP Directive (script-src):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const cspDirective = `script-src 'self' ${hashes.join(' ')} https://www.googletagmanager.com https://static.hotjar.com https://cdn.mxpnl.com 'unsafe-inline';`;

  console.log(cspDirective);
  console.log('');

  // Also output as individual directives for easier copy-paste
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Individual Hash Directives:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  hashes.forEach((hash, index) => {
    console.log(`${hash}  # Script #${index + 1}`);
  });

  console.log('\n✅ Done!\n');
  console.log('Note: Add these hashes to your Content-Security-Policy header.');
  console.log('      Remove \'unsafe-inline\' once all scripts have hashes for better security.\n');
}

main();

#!/usr/bin/env node

/**
 * Test script to verify OpenAI Realtime API client_secrets endpoint
 * Usage: CHATBOT_API_KEY=your_key_here node scripts/test-openai-token.js
 */

const https = require('https');

const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY;

if (!CHATBOT_API_KEY) {
  console.error('❌ Error: CHATBOT_API_KEY environment variable is required');
  console.error('Usage: CHATBOT_API_KEY=your_key_here node scripts/test-openai-token.js');
  process.exit(1);
}

const CHAT_INSTRUCTIONS = "You are a helpful assistant for the Bipquantum intellectual property marketplace. Help users understand and navigate the platform.";

// Escape JSON strings
function escapeJSON(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const requestBody = JSON.stringify({
  expires_after: {
    anchor: "created_at",
    seconds: 60
  },
  session: {
    type: "realtime",
    model: "gpt-realtime",
    instructions: CHAT_INSTRUCTIONS
  }
});

console.log('📡 Testing OpenAI Realtime API client_secrets endpoint...\n');
console.log('Request Body:');
console.log(JSON.stringify(JSON.parse(requestBody), null, 2));
console.log('\n---\n');

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/realtime/client_secrets',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CHATBOT_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  console.log(`Status Code: ${res.statusCode}`);
  console.log('Response Headers:', res.headers);
  console.log('\n---\n');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));

      if (res.statusCode === 200) {
        console.log('\n✅ Success! Ephemeral token retrieved.');
        if (parsed.client_secret?.value) {
          console.log(`🔑 Client Secret: ${parsed.client_secret.value.substring(0, 20)}...`);
          console.log(`⏱️  Expires at: ${parsed.client_secret?.expires_at || 'N/A'}`);
        }
      } else {
        console.log(`\n❌ Error: API returned status ${res.statusCode}`);
      }
    } catch (e) {
      console.log(data);
      console.log(`\n❌ Failed to parse JSON response: ${e.message}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
  process.exit(1);
});

req.write(requestBody);
req.end();

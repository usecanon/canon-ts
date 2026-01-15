/**
 * Simple integration test for Canon SDK with WebSocket broadcasting
 *
 * Prerequisites:
 * - Canon Node running (cargo run --bin canon-node)
 * - Valid JWT token (register/login via API)
 * - Project created with a valid project_id
 *
 * Usage:
 *   node test-integration.js
 */

const { createCanonClient } = require('./dist/index.js');

// Configuration from environment or defaults
const ENDPOINT = process.env.CANON_ENDPOINT || 'http://localhost:8080';
const PROJECT_ID = process.env.CANON_PROJECT_ID || 'test-project';
const API_KEY = process.env.CANON_API_KEY || 'test-key';

async function main() {
  console.log('Canon SDK Integration Test');
  console.log('===========================\n');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...\n`);

  // Create Canon client
  const canon = createCanonClient({
    endpoint: ENDPOINT,
    projectId: PROJECT_ID,
    apiKey: API_KEY,
  });

  // Test 1: Get current state (HTTP)
  console.log('Test 1: Fetching current state...');
  try {
    const state = await canon.state.get('/');
    console.log('✓ State fetched successfully:');
    console.log(JSON.stringify(state, null, 2));
    console.log();
  } catch (error) {
    console.error('✗ Failed to fetch state:', error.message);
    console.log();
  }

  // Test 2: Get state with envelope format
  console.log('Test 2: Fetching state with envelope...');
  try {
    const envelope = await canon.state.get('/', { format: 'envelope' });
    console.log('✓ Envelope fetched successfully:');
    console.log('  Path:', envelope.path);
    console.log('  Cursor:', envelope.cursor);
    console.log('  Updated at:', envelope.updated_at);
    console.log('  Value keys:', Object.keys(envelope.value));
    console.log();
  } catch (error) {
    console.error('✗ Failed to fetch envelope:', error.message);
    console.log();
  }

  // Test 3: Subscribe to real-time updates (WebSocket)
  console.log('Test 3: Subscribing to real-time updates...');
  console.log('Waiting for state updates (press Ctrl+C to exit)...\n');

  let messageCount = 0;

  const unsubscribe = canon.state.subscribe(
    (message) => {
      messageCount++;

      if (message.type === 'snapshot') {
        console.log(`[${new Date().toISOString()}] Snapshot received (message #${messageCount})`);
        console.log('  Path:', message.path);
        console.log('  Cursor:', message.cursor);
        console.log('  Value keys:', Object.keys(message.value || {}));
      } else if (message.type === 'update') {
        console.log(`[${new Date().toISOString()}] Update received (message #${messageCount})`);
        console.log('  Cursor:', message.cursor);
        console.log('  Has snapshot:', !!message.snapshot);
        console.log('  Has patch:', !!message.patch);
      }

      console.log();
    },
    {
      reconnect: true,
      reconnectMaxDelayMs: 30000,
    }
  );

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    unsubscribe();
    setTimeout(() => {
      console.log('Total messages received:', messageCount);
      process.exit(0);
    }, 500);
  });

  // Provide instructions
  console.log('📝 To trigger a state update, run this in another terminal:');
  console.log(`
  curl -X PUT ${ENDPOINT}/v1/projects/${PROJECT_ID}/state \\
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{"state_json": {"count": 42, "timestamp": "'$(date -u +%s)'"}}'
  `);
  console.log();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

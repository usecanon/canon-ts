# SDK Integration Testing

This directory contains integration tests for the Canon SDK with WebSocket broadcasting.

## Prerequisites

1. **Canon Node running**:
   ```bash
   cd ../node
   cargo run --bin canon-node
   ```

2. **Create a test user and project**:
   ```bash
   # Register user
   curl -X POST http://localhost:8080/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

   # Login to get JWT token
   curl -X POST http://localhost:8080/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   # Save the token from the response

   # Create project
   curl -X POST http://localhost:8080/v1/projects \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_id": "test-project",
       "name": "Test Project",
       "idl_json": {
         "version": "0.1.0",
         "name": "test_program"
       }
     }'
   ```

3. **Build the SDK**:
   ```bash
   npm install
   npx tsc
   ```

## Running the Integration Test

### Basic Test
```bash
# Set environment variables
export CANON_ENDPOINT=http://localhost:8080
export CANON_PROJECT_ID=test-project
export CANON_API_KEY=YOUR_JWT_TOKEN

# Run test
node test-integration.js
```

### What the Test Does

The test performs three operations:

1. **HTTP GET (value format)**: Fetches current state as raw JSON
2. **HTTP GET (envelope format)**: Fetches state with metadata (cursor, timestamp)
3. **WebSocket Subscribe**: Opens persistent connection to receive real-time updates

### Triggering State Updates

While the test is running, trigger a state update in another terminal:

```bash
curl -X PUT http://localhost:8080/v1/projects/test-project/state \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state_json": {"count": 42, "timestamp": 1234567890}}'
```

The WebSocket client should immediately receive the update and print it to the console.

## Expected Output

```
Canon SDK Integration Test
===========================

Endpoint: http://localhost:8080
Project: test-project
API Key: eyJhbGciO...

Test 1: Fetching current state...
✓ State fetched successfully:
{
  "count": 0
}

Test 2: Fetching state with envelope...
✓ Envelope fetched successfully:
  Path: /
  Cursor: { slot: 150000000 }
  Updated at: 2026-01-14T03:00:00Z
  Value keys: [ 'count' ]

Test 3: Subscribing to real-time updates...
Waiting for state updates (press Ctrl+C to exit)...

[2026-01-14T03:00:00.000Z] Snapshot received (message #1)
  Path: /
  Cursor: { slot: 150000000 }
  Value keys: [ 'count' ]

📝 To trigger a state update, run this in another terminal:
...

[2026-01-14T03:01:00.000Z] Update received (message #2)
  Cursor: { slot: 150000001 }
  Has snapshot: true
  Has patch: false
```

## Troubleshooting

### Connection Refused
- Ensure Canon Node is running: `cargo run --bin canon-node`
- Check the API port (default: 8080)

### 401 Unauthorized
- Verify JWT token is valid and not expired
- Re-login to get a fresh token

### 404 Not Found
- Verify project exists: `curl http://localhost:8080/v1/projects -H "Authorization: Bearer TOKEN"`
- Check project_id matches

### WebSocket Connection Fails
- Check firewall settings
- Verify WebSocket endpoint is accessible
- Look for errors in Canon Node logs

### No Updates Received
- Ensure state update API call succeeds (check response)
- Verify broadcaster is integrated (check Canon Node logs)
- Try restarting the Canon Node

## Manual Testing with wscat

You can also test WebSocket directly:

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:8080/v1/projects/test-project/state/subscribe?api_key=YOUR_JWT_TOKEN"

# You should immediately receive a snapshot message
```

## Next Steps

1. **Automated Tests**: Add proper unit/integration tests with a test framework
2. **CI Integration**: Run tests in CI pipeline
3. **Performance Tests**: Test with multiple concurrent subscribers
4. **Stress Tests**: Test with high-frequency state updates
5. **Reconnection Tests**: Test auto-reconnect behavior

# @canon-solana/sdk

TypeScript SDK for [Canon](https://usecanon.dev) - Reactive state streams for Solana programs.

## Installation

```bash
npm install @canon-solana/sdk
```

For Node.js environments, also install the WebSocket peer dependency:

```bash
npm install ws
```

## Quick Start

```typescript
import { createCanonClient } from "@canon-solana/sdk";

// Create client
const canon = createCanonClient({
  endpoint: "https://api.usecanon.dev",
  projectId: "your-project-id",
  apiKey: "your-api-key",
});

// Get full state
const state = await canon.state.get("/");
console.log("Full state:", state);

// Get value at specific path
const balance = await canon.state.get("/users/9x.../balance", {
  format: "value",
});
console.log("Balance:", balance);

// Subscribe to real-time updates
const unsubscribe = canon.state.subscribe((message) => {
  if (message.type === "snapshot") {
    console.log("Initial snapshot:", message.value);
  } else if (message.type === "update") {
    console.log("State updated:", message);
  }
});

// Later: unsubscribe
unsubscribe();
```

## API Reference

### `createCanonClient(config)`

Creates a new Canon client instance.

**Parameters:**

- `config.endpoint` (string, required): API endpoint URL
- `config.projectId` (string, required): Your Canon project ID
- `config.apiKey` (string, required): Your API key for authentication

**Returns:** `CanonClient`

### `canon.state.get(path?, opts?)`

Fetches the current state value.

**Parameters:**

- `path` (string, optional): JSON path to fetch (default: `"/"` for full state)
- `opts.format` ("envelope" | "value", optional): Response format
  - `"envelope"`: Includes metadata (cursor, version, timestamp)
  - `"value"`: Returns raw value only (default)

**Returns:** `Promise<any>`

**Examples:**

```typescript
// Get full state
const fullState = await canon.state.get("/");

// Get nested value
const userBalance = await canon.state.get("/users/abc123/balance");

// Get with envelope (includes metadata)
const envelope = await canon.state.get("/", { format: "envelope" });
console.log(envelope.value); // state value
console.log(envelope.cursor); // { slot: 12345 }
console.log(envelope.updated_at); // "2024-01-15T10:30:00Z"
```

### `canon.state.subscribe(callback, opts?)`

Subscribes to real-time state updates via WebSocket.

**Parameters:**

- `callback` (function): Called when state changes
  - Receives `StateMessage` (either `SnapshotMessage` or `UpdateMessage`)
- `opts.reconnect` (boolean, optional): Auto-reconnect on disconnect (default: `true`)
- `opts.reconnectMaxDelayMs` (number, optional): Max reconnection delay (default: `30000`)

**Returns:** `UnsubscribeFn` - Call this function to unsubscribe

**Examples:**

```typescript
// Basic subscription
const unsub = canon.state.subscribe((msg) => {
  console.log("State update:", msg);
});

// With options
const unsub = canon.state.subscribe(
  (msg) => {
    if (msg.type === "snapshot") {
      // Initial or full state snapshot
      console.log("Snapshot at slot", msg.cursor?.slot);
      console.log("State:", msg.value);
    } else if (msg.type === "update") {
      // Incremental update
      if (msg.patch) {
        // JSON Patch operations
        console.log("Patch:", msg.patch);
      } else if (msg.snapshot) {
        // Fallback full snapshot
        console.log("Snapshot:", msg.snapshot);
      }
    }
  },
  {
    reconnect: true,
    reconnectMaxDelayMs: 30000,
  }
);

// Don't forget to unsubscribe when done
unsub();
```

### `canon.state.select(value, path)`

Client-side helper to traverse a state object by path.

**Parameters:**

- `value` (any): State object to traverse
- `path` (string | string[]): Path as string (`"/users/abc/balance"`) or array (`["users", "abc", "balance"]`)

**Returns:** `any` - Value at path, or `undefined` if not found

**Examples:**

```typescript
const state = await canon.state.get("/");

// Select nested value
const balance = canon.state.select(state, "/users/abc123/balance");
// or
const balance = canon.state.select(state, ["users", "abc123", "balance"]);
```

### Message Types

#### `SnapshotMessage`

Full state snapshot:

```typescript
{
  type: "snapshot";
  path: "/";
  value: any; // State value
  cursor?: { slot: number };
  reducer_version?: string | null;
  updated_at?: string; // RFC 3339 timestamp
}
```

#### `UpdateMessage`

Incremental state update:

```typescript
{
  type: "update";
  cursor?: { slot: number };
  updated_at?: string;
  patch?: PatchOperation[]; // JSON Patch operations
  snapshot?: any; // Fallback full snapshot
}
```

## Environment Support

- ✅ Modern browsers (using native `fetch` and `WebSocket`)
- ✅ Node.js 18+ (install `ws` peer dependency for WebSocket support)
- ✅ Edge runtimes (Cloudflare Workers, Vercel Edge Functions, etc.)

## Error Handling

The SDK throws specific error types for different scenarios:

- `ApiError`: API request failed
- `WebSocketError`: WebSocket connection error
- `PathError`: Invalid path traversal
- `NotImplementedError`: Feature not yet available

```typescript
import { ApiError, WebSocketError } from "@canon-solana/sdk";

try {
  const state = await canon.state.get("/nonexistent");
} catch (error) {
  if (error instanceof ApiError) {
    console.error("API error:", error.statusCode, error.message);
  }
}
```

## Path Syntax

Paths use JSON Pointer-like syntax:

- `/` - Root (full state)
- `/users` - Top-level key
- `/users/abc123` - Nested key
- `/users/abc123/balance` - Deep nesting
- `/items/0` - Array index

**Limitations (v1):**

- No escaping of special characters (`/`, `~`)
- Segments are treated as literal keys or array indices

## State Guarantees

Canon guarantees:

- ✅ State is **always derived** from reducers processing Solana events
- ✅ No arbitrary state writes - state changes only through reducers
- ✅ Large integers are preserved as strings (no precision loss)
- ✅ State is versioned by Solana slot number
- ✅ Updates are real-time and consistent

## License

MIT

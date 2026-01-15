/**
 * Configuration for creating a Canon client
 */
export interface CanonClientConfig {
  /** API endpoint (e.g., "https://api.usecanon.dev" or "http://localhost:8080") */
  endpoint: string;
  /** Project ID */
  projectId: string;
  /** API key for authentication */
  apiKey: string;
}

/**
 * Cursor representing a point in the state timeline
 */
export interface StateCursor {
  slot: number;
}

/**
 * Options for state.get() requests
 */
export interface StateGetOptions {
  /** Response format: "envelope" includes metadata, "value" returns raw value */
  format?: "envelope" | "value";
}

/**
 * Envelope response wrapping state value with metadata
 */
export interface StateEnvelope {
  path: string;
  value: any;
  cursor?: StateCursor;
  reducer_version?: string | null;
  updated_at?: string;
}

/**
 * JSON Patch operation (RFC 6902)
 */
export interface PatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: any;
  from?: string;
}

/**
 * Snapshot message: full state at a point in time
 */
export interface SnapshotMessage {
  type: "snapshot";
  path: string;
  value: any;
  cursor?: StateCursor;
  reducer_version?: string | null;
  updated_at?: string;
}

/**
 * Update message: incremental state change
 */
export interface UpdateMessage {
  type: "update";
  cursor?: StateCursor;
  updated_at?: string;
  /** JSON Patch operations (if supported) */
  patch?: PatchOperation[];
  /** Full snapshot (fallback if patch not available) */
  snapshot?: any;
}

/**
 * Union of all state messages
 */
export type StateMessage = SnapshotMessage | UpdateMessage;

/**
 * Options for WebSocket subscription
 */
export interface SubscribeOptions {
  /** Auto-reconnect on disconnect */
  reconnect?: boolean;
  /** Maximum reconnect delay in milliseconds */
  reconnectMaxDelayMs?: number;
}

/**
 * Function to unsubscribe from state updates
 */
export type UnsubscribeFn = () => void;

/**
 * Callback for receiving state messages
 */
export type StateMessageCallback = (message: StateMessage) => void;

/**
 * State API interface
 */
export interface StateAPI {
  /**
   * Get current state value
   * @param path - JSON path (default: "/" for full state)
   * @param opts - Request options
   */
  get(path?: string, opts?: StateGetOptions): Promise<any>;

  /**
   * Subscribe to real-time state updates
   * @param callback - Function called when state updates
   * @param opts - Subscription options
   * @returns Unsubscribe function
   */
  subscribe(callback: StateMessageCallback, opts?: SubscribeOptions): UnsubscribeFn;

  /**
   * Select a value from state by path (client-side traversal)
   * @param value - State object
   * @param path - Path as string or array
   */
  select(value: any, path: string | string[]): any;
}

/**
 * Events API interface (stub for future implementation)
 */
export interface EventsAPI {
  /**
   * List events (not yet implemented)
   */
  list(...args: any[]): Promise<any>;
}

/**
 * Main Canon client interface
 */
export interface CanonClient {
  /** State API for reading and subscribing to state */
  state: StateAPI;
  /** Events API for querying events */
  events: EventsAPI;
}

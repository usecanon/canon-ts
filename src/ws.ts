import type {
  StateMessageCallback,
  SubscribeOptions,
  UnsubscribeFn,
} from "./types.js";
import { WebSocketError } from "./errors.js";

// WebSocket implementation - works in browser and Node
const getWebSocketImpl = (): any => {
  // Browser environment
  if (typeof WebSocket !== "undefined") {
    return WebSocket;
  }

  // Node environment - try to load ws module
  try {
    // Dynamic import for optional peer dependency
    return require("ws");
  } catch {
    throw new WebSocketError(
      "WebSocket not available. In Node.js, install 'ws' package: npm install ws"
    );
  }
};

/**
 * WebSocket client for real-time state subscriptions
 */
export class StateSubscriptionClient {
  private ws: any = null;
  private reconnectAttempt = 0;
  private reconnectTimer: any = null;
  private shouldReconnect = false;
  private callback: StateMessageCallback;
  private opts: Required<SubscribeOptions>;

  constructor(
    private url: string,
    callback: StateMessageCallback,
    opts?: SubscribeOptions
  ) {
    this.callback = callback;
    this.opts = {
      reconnect: opts?.reconnect ?? true,
      reconnectMaxDelayMs: opts?.reconnectMaxDelayMs ?? 30000,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    this.shouldReconnect = this.opts.reconnect;

    try {
      const WS = getWebSocketImpl();
      this.ws = new WS(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempt = 0;
      };

      this.ws.onmessage = (event: any) => {
        try {
          const data =
            typeof event.data === "string" ? event.data : event.data.toString();
          const message = JSON.parse(data);
          this.callback(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (event: any) => {
        console.error("WebSocket error:", event);
      };

      this.ws.onclose = () => {
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      throw new WebSocketError(
        `Failed to connect to WebSocket: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, ...up to max
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempt),
      this.opts.reconnectMaxDelayMs
    );

    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Disconnect and clean up
   */
  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Set onclose to null to prevent reconnection attempt
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws && this.ws.readyState === 1; // WebSocket.OPEN
  }
}

/**
 * Create WebSocket URL for state subscription
 */
export function createSubscriptionUrl(
  endpoint: string,
  projectId: string,
  apiKey: string
): string {
  // Convert HTTP(S) endpoint to WS(S)
  const wsEndpoint = endpoint.replace(/^http/, "ws");

  // Build URL with api_key in query param (for browser compatibility)
  const url = new URL(
    `/v1/projects/${projectId}/state/subscribe`,
    wsEndpoint
  );
  url.searchParams.set("api_key", apiKey);

  return url.toString();
}

/**
 * Create a state subscription
 */
export function createSubscription(
  endpoint: string,
  projectId: string,
  apiKey: string,
  callback: StateMessageCallback,
  opts?: SubscribeOptions
): UnsubscribeFn {
  const url = createSubscriptionUrl(endpoint, projectId, apiKey);
  const client = new StateSubscriptionClient(url, callback, opts);

  client.connect();

  // Return unsubscribe function
  return () => {
    client.disconnect();
  };
}

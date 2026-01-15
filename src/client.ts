import type { CanonClient, CanonClientConfig, EventsAPI } from "./types.js";
import { StateClient } from "./state.js";
import { NotImplementedError } from "./errors.js";

/**
 * Events API stub (not yet implemented)
 */
class EventsClient implements EventsAPI {
  list(..._args: any[]): Promise<any> {
    throw new NotImplementedError(
      "Events API is not yet implemented. Coming soon!"
    );
  }
}

/**
 * Main Canon client implementation
 */
export class Client implements CanonClient {
  public readonly state: StateClient;
  public readonly events: EventsAPI;

  constructor(config: CanonClientConfig) {
    // Validate configuration
    if (!config.endpoint) {
      throw new Error("endpoint is required");
    }
    if (!config.projectId) {
      throw new Error("projectId is required");
    }
    if (!config.apiKey) {
      throw new Error("apiKey is required");
    }

    // Initialize APIs
    this.state = new StateClient(
      config.endpoint,
      config.projectId,
      config.apiKey
    );
    this.events = new EventsClient();
  }
}

/**
 * Create a Canon client instance
 *
 * @example
 * ```typescript
 * const canon = createCanonClient({
 *   endpoint: "https://api.usecanon.dev",
 *   projectId: "my-project",
 *   apiKey: "my-api-key"
 * });
 *
 * // Get full state
 * const state = await canon.state.get("/");
 *
 * // Get value at path
 * const balance = await canon.state.get("/users/9x.../balance", { format: "value" });
 *
 * // Subscribe to updates
 * const unsub = canon.state.subscribe((msg) => {
 *   console.log("State update:", msg);
 * });
 * ```
 */
export function createCanonClient(config: CanonClientConfig): CanonClient {
  return new Client(config);
}

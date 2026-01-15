import type {
  StateAPI,
  StateGetOptions,
  StateMessageCallback,
  SubscribeOptions,
  UnsubscribeFn,
} from "./types.js";
import { ApiError, PathError } from "./errors.js";
import { createSubscription } from "./ws.js";

/**
 * State API implementation
 */
export class StateClient implements StateAPI {
  constructor(
    private endpoint: string,
    private projectId: string,
    private apiKey: string
  ) {}

  /**
   * Get current state value
   */
  async get(path?: string, opts?: StateGetOptions): Promise<any> {
    const format = opts?.format ?? "value";
    const statePath = path ?? "/";

    // Build URL
    const url = new URL(
      `/v1/projects/${this.projectId}/state`,
      this.endpoint
    );
    url.searchParams.set("path", statePath);
    url.searchParams.set("format", format);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new ApiError(
          `Failed to get state: ${text || response.statusText}`,
          response.status,
          text
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Subscribe to real-time state updates
   */
  subscribe(
    callback: StateMessageCallback,
    opts?: SubscribeOptions
  ): UnsubscribeFn {
    return createSubscription(
      this.endpoint,
      this.projectId,
      this.apiKey,
      callback,
      opts
    );
  }

  /**
   * Select a value from state by path (client-side traversal)
   * This is a helper for client-side path navigation
   */
  select(value: any, path: string | string[]): any {
    if (value === null || value === undefined) {
      return undefined;
    }

    // Convert string path to array
    const segments =
      typeof path === "string"
        ? path.split("/").filter((s) => s.length > 0)
        : path;

    // Traverse the value
    let current = value;
    for (const segment of segments) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array index
      if (Array.isArray(current)) {
        const index = parseInt(segment, 10);
        if (isNaN(index) || index < 0 || index >= current.length) {
          throw new PathError(`Invalid array index: ${segment}`, path.toString());
        }
        current = current[index];
      }
      // Handle object key
      else if (typeof current === "object") {
        current = current[segment];
      }
      // Cannot traverse further
      else {
        throw new PathError(
          `Cannot traverse non-object/array at segment: ${segment}`,
          path.toString()
        );
      }
    }

    return current;
  }
}

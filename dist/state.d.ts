import type { StateAPI, StateGetOptions, StateMessageCallback, SubscribeOptions, UnsubscribeFn } from "./types.js";
/**
 * State API implementation
 */
export declare class StateClient implements StateAPI {
    private endpoint;
    private projectId;
    private apiKey;
    constructor(endpoint: string, projectId: string, apiKey: string);
    /**
     * Get current state value
     */
    get(path?: string, opts?: StateGetOptions): Promise<any>;
    /**
     * Subscribe to real-time state updates
     */
    subscribe(callback: StateMessageCallback, opts?: SubscribeOptions): UnsubscribeFn;
    /**
     * Select a value from state by path (client-side traversal)
     * This is a helper for client-side path navigation
     */
    select(value: any, path: string | string[]): any;
}

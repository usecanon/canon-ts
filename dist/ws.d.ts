import type { StateMessageCallback, SubscribeOptions, UnsubscribeFn } from "./types.js";
/**
 * WebSocket client for real-time state subscriptions
 */
export declare class StateSubscriptionClient {
    private url;
    private ws;
    private reconnectAttempt;
    private reconnectTimer;
    private shouldReconnect;
    private callback;
    private opts;
    constructor(url: string, callback: StateMessageCallback, opts?: SubscribeOptions);
    /**
     * Connect to WebSocket server
     */
    connect(): void;
    /**
     * Schedule reconnection with exponential backoff
     */
    private scheduleReconnect;
    /**
     * Disconnect and clean up
     */
    disconnect(): void;
    /**
     * Check if WebSocket is connected
     */
    isConnected(): boolean;
}
/**
 * Create WebSocket URL for state subscription
 */
export declare function createSubscriptionUrl(endpoint: string, projectId: string, apiKey: string): string;
/**
 * Create a state subscription
 */
export declare function createSubscription(endpoint: string, projectId: string, apiKey: string, callback: StateMessageCallback, opts?: SubscribeOptions): UnsubscribeFn;

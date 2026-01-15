/**
 * @canon-solana/sdk - TypeScript SDK for Canon
 *
 * Reactive state streams for Solana programs
 */
export { createCanonClient } from "./client.js";
export type { CanonClient, CanonClientConfig, StateAPI, EventsAPI, StateGetOptions, StateEnvelope, StateCursor, StateMessage, SnapshotMessage, UpdateMessage, PatchOperation, SubscribeOptions, UnsubscribeFn, StateMessageCallback, } from "./types.js";
export { CanonError, ApiError, WebSocketError, PathError, NotImplementedError, } from "./errors.js";

/**
 * Base error class for Canon SDK errors
 */
export declare class CanonError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when API request fails
 */
export declare class ApiError extends CanonError {
    statusCode?: number | undefined;
    response?: any | undefined;
    constructor(message: string, statusCode?: number | undefined, response?: any | undefined);
}
/**
 * Error thrown when WebSocket connection fails
 */
export declare class WebSocketError extends CanonError {
    event?: any | undefined;
    constructor(message: string, event?: any | undefined);
}
/**
 * Error thrown when path traversal fails
 */
export declare class PathError extends CanonError {
    path?: string | undefined;
    constructor(message: string, path?: string | undefined);
}
/**
 * Error thrown for not-yet-implemented features
 */
export declare class NotImplementedError extends CanonError {
    constructor(message?: string);
}

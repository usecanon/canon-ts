/**
 * Base error class for Canon SDK errors
 */
export class CanonError extends Error {
    constructor(message) {
        super(message);
        this.name = "CanonError";
    }
}
/**
 * Error thrown when API request fails
 */
export class ApiError extends CanonError {
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
        this.name = "ApiError";
    }
}
/**
 * Error thrown when WebSocket connection fails
 */
export class WebSocketError extends CanonError {
    constructor(message, event) {
        super(message);
        this.event = event;
        this.name = "WebSocketError";
    }
}
/**
 * Error thrown when path traversal fails
 */
export class PathError extends CanonError {
    constructor(message, path) {
        super(message);
        this.path = path;
        this.name = "PathError";
    }
}
/**
 * Error thrown for not-yet-implemented features
 */
export class NotImplementedError extends CanonError {
    constructor(message = "This feature is not yet implemented") {
        super(message);
        this.name = "NotImplementedError";
    }
}

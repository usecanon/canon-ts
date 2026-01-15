/**
 * Base error class for Canon SDK errors
 */
export class CanonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonError";
  }
}

/**
 * Error thrown when API request fails
 */
export class ApiError extends CanonError {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Error thrown when WebSocket connection fails
 */
export class WebSocketError extends CanonError {
  constructor(message: string, public event?: any) {
    super(message);
    this.name = "WebSocketError";
  }
}

/**
 * Error thrown when path traversal fails
 */
export class PathError extends CanonError {
  constructor(message: string, public path?: string) {
    super(message);
    this.name = "PathError";
  }
}

/**
 * Error thrown for not-yet-implemented features
 */
export class NotImplementedError extends CanonError {
  constructor(message: string = "This feature is not yet implemented") {
    super(message);
    this.name = "NotImplementedError";
  }
}

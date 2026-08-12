/**
 * pULID-specific error classes
 */

/**
 * Base pULID error class
 */
export class pULIDError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'pULIDError';
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when parsing a pULID string fails
 */
export class pULIDParseError extends pULIDError {
  constructor(message: string) {
    super(message);
    this.name = 'pULIDParseError';
  }
}

/**
 * Error thrown when an invalid scope value is used
 */
export class pULIDScopeError extends pULIDError {
  constructor(message: string) {
    super(message);
    this.name = 'pULIDScopeError';
  }
}

/**
 * Error thrown when timestamp operations fail
 */
export class pULIDTimestampError extends pULIDError {
  constructor(message: string) {
    super(message);
    this.name = 'pULIDTimestampError';
  }
}

/**
 * Error thrown when UUID conversion operations fail
 */
export class pULIDUUIDError extends pULIDError {
  constructor(message: string) {
    super(message);
    this.name = 'pULIDUUIDError';
  }
}

/**
 * Error thrown when entropy generation fails
 */
export class pULIDEntropyError extends pULIDError {
  constructor(message: string) {
    super(message);
    this.name = 'pULIDEntropyError';
  }
}

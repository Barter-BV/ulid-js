/**
 * Main pULID class implementation
 * Combines timestamp, scope, and entropy into a pULID identifier
 */

import { bytesToEntropy, bytesToScope, bytesToTimestamp, decodeBase32, encodeBase32 } from './encoding';
import { generateEntropy } from './entropy';
import { pULIDError, pULIDParseError } from './errors';
import { scopeToBytes, validateScope } from './scope';
import { timestampToBytes, validateTimestamp } from './timestamp';
import type { GenerateOptions, PULIDJSON } from './types';
import { formatAsUUID, uuidToBytes } from './uuid';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * pULID class representing a Pixie ULID identifier
 * Structure: 6 bytes timestamp + 2 bytes scope + 8 bytes entropy = 16 bytes total
 */
export class pULID {
  readonly timestamp: number;
  readonly scope: number;
  readonly entropy: Uint8Array;

  /**
   * Create a new pULID instance
   * @param {number} timestamp - Unix timestamp in milliseconds
   * @param {number} scope - Scope value (1-65534)
   * @param {Uint8Array} entropy - 8 bytes of entropy
   */
  constructor(timestamp: number, scope: number, entropy: Uint8Array) {
    // Validate inputs
    validateTimestamp(timestamp);

    // If scope is 0, convert to MAX_SCOPE (65535)
    const actualScope = scope === 0 ? 65535 : scope;

    // For all other scopes, validate normally
    if (scope !== 0) {
      validateScope(scope);
    }

    if (!entropy || entropy.length !== 8) {
      throw new pULIDError(`Invalid entropy: expected 8 bytes, got ${entropy ? entropy.length : 0}`);
    }

    this.timestamp = timestamp;
    this.scope = actualScope; // Store the actual scope (65535 if input was 0)
    this.entropy = new Uint8Array(entropy); // Create a copy to prevent external modification
  }

  /**
   * Convert pULID to string representation (ULID format)
   * @returns {string} 26-character Base32 encoded string
   */
  toString(): string {
    const bytes = this.toBytes();
    return encodeBase32(bytes);
  }

  /**
   * Convert pULID to UUID format
   * @returns {string} UUID string in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */
  toUUID(): string {
    const bytes = this.toBytes();
    return formatAsUUID(bytes);
  }

  /**
   * Convert pULID to ULID format
   * @returns {string} ULID string in format
   */
  toULID(): string {
    return this.toString();
  }

  /**
   * Convert pULID to 16-byte array
   * @returns {Uint8Array} 16-byte array (6+2+8 structure)
   */
  toBytes(): Uint8Array {
    const timestampBytes = timestampToBytes(this.timestamp);
    const scopeBytes = scopeToBytes(this.scope);
    
    // Combine all bytes: timestamp + scope + entropy
    const bytes = new Uint8Array(16);
    bytes.set(timestampBytes, 0);  // bytes 0-5
    bytes.set(scopeBytes, 6);      // bytes 6-7
    bytes.set(this.entropy, 8);    // bytes 8-15
    
    return bytes;
  }

  /**
   * Get timestamp as Date object
   * @returns {Date} Date object representing the timestamp
   */
  getTime(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Get timestamp as milliseconds
   * @returns {number} Unix timestamp in milliseconds
   */
  getTimestamp(): number {
    return this.timestamp;
  }

  /**
   * Get scope value
   * @returns {number} Scope value (1-65534)
   */
  getScope(): number {
    return this.scope;
  }

  /**
   * Get entropy bytes
   * @returns {Uint8Array} Copy of the 8-byte entropy array
   */
  getEntropy(): Uint8Array {
    return new Uint8Array(this.entropy);
  }

  /**
   * Compare this pULID with another pULID
   * @param {pULID} other - Another pULID instance
   * @returns {number} -1, 0, or 1 for less than, equal, or greater than
   */
  compare(other: pULID): number {
    if (!(other instanceof pULID)) {
      throw new pULIDError('Cannot compare with non-pULID object');
    }

    // Compare lexicographically by string representation
    const thisStr = this.toString();
    const otherStr = other.toString();
    
    if (thisStr < otherStr) return -1;
    if (thisStr > otherStr) return 1;
    return 0;
  }

  /**
   * Check if this pULID equals another pULID
   * @param {pULID} other - Another pULID instance
   * @returns {boolean} True if equal
   */
  equals(other: pULID): boolean {
    return this.compare(other) === 0;
  }

  /**
   * Get JSON representation
   * @returns {Object} Object with timestamp, scope, entropy, ulid, and uuid
   */
  toJSON(): PULIDJSON {
    return {
      timestamp: this.timestamp,
      scope: this.scope,
      entropy: Array.from(this.entropy),
      ulid: this.toString(),
      uuid: this.toUUID(),
      date: this.getTime().toISOString()
    };
  }

  /**
   * Generate a new pULID with current timestamp
   * @param {Object} options - Generation options
   * @param {number} [options.timestamp] - Custom timestamp (defaults to current time)
   * @param {number} [options.scope=1] - Scope value (defaults to 1)
   * @param {Uint8Array} [options.entropy] - Custom entropy (defaults to random)
   * @returns {pULID} New pULID instance
   */
  static generate(options: GenerateOptions = {}): pULID {
    const timestamp = options.timestamp ?? Date.now();
    const scope = options.scope ?? 1;
    const entropy = options.entropy ?? generateEntropy();

    return new pULID(timestamp, scope, entropy);
  }

  /**
   * Parse pULID from ULID string representation
   * @param {string} string - 26-character ULID string
   * @returns {pULID} Parsed pULID instance
   * @throws {pULIDParseError} If string is invalid
   */
  static parse(string: string): pULID {
    if (typeof string !== 'string') {
      throw new pULIDParseError(`Invalid input type: ${typeof string}. Expected string`);
    }

    if (string.length !== 26) {
      throw new pULIDParseError(`Invalid ULID length: ${string.length}. Expected 26 characters`);
    }

    try {
      const bytes = decodeBase32(string);
      return pULID.fromBytes(bytes);
    } catch (error: unknown) {
      throw new pULIDParseError(`Failed to parse ULID string: ${errorMessage(error)}`);
    }
  }

  /**
   * Create pULID from 16-byte array
   * @param {Uint8Array} bytes - 16-byte array
   * @returns {pULID} New pULID instance
   * @throws {pULIDParseError} If bytes are invalid
   */
  static fromBytes(bytes: Uint8Array): pULID {
    if (!bytes || bytes.length !== 16) {
      throw new pULIDParseError(`Invalid byte array: expected 16 bytes, got ${bytes ? bytes.length : 0}`);
    }

    try {
      const timestamp = bytesToTimestamp(bytes);
      const scope = bytesToScope(bytes);
      const entropy = bytesToEntropy(bytes);

      return new pULID(timestamp, scope, entropy);
    } catch (error: unknown) {
      throw new pULIDParseError(`Failed to parse bytes: ${errorMessage(error)}`);
    }
  }

  /**
   * Parse pULID from UUID string
   * @param {string} uuid - UUID string
   * @returns {pULID} New pULID instance
   * @throws {pULIDParseError} If UUID is invalid
   */
  static fromUUID(uuid: string): pULID {
    try {
      const bytes = uuidToBytes(uuid);
      return pULID.fromBytes(bytes);
    } catch (error: unknown) {
      throw new pULIDParseError(`Failed to parse UUID: ${errorMessage(error)}`);
    }
  }

  /**
   * Validate pULID string format
   * @param {string} string - String to validate
   * @returns {boolean} True if valid pULID string
   */
  static isValid(string: string): boolean {
    try {
      pULID.parse(string);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate multiple pULIDs at once
   * @param {number} count - Number of pULIDs to generate
   * @param {Object} options - Generation options
   * @returns {pULID[]} Array of pULID instances
   */
  static generateBatch(count: number, options: GenerateOptions = {}): pULID[] {
    const results: pULID[] = [];
    for (let i = 0; i < count; i++) {
      results.push(pULID.generate(options));
    }
    return results;
  }

  /**
   * Sort an array of pULIDs lexicographically
   * @param {pULID[]} pulids - Array of pULID instances
   * @returns {pULID[]} Sorted array
   */
  static sort(pulids: pULID[]): pULID[] {
    return pulids.slice().sort((a, b) => a.compare(b));
  }
}

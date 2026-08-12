/**
 * pULID Generator class for controlled pULID generation
 * Provides configurable generation with default settings
 */

import { EntropyGenerator } from './entropy';
import { pULIDError } from './errors';
import { pULID } from './pulid';
import { ScopeManager } from './scope';
import { TimestampGenerator } from './timestamp';
import type { GenerateOptions, GeneratorConfig, GeneratorOptions } from './types';

/**
 * pULID Generator class for controlled generation
 */
export class pULIDGenerator {
  defaultScope: number;
  readonly validateScope: boolean;
  readonly entropyGenerator: EntropyGenerator;
  readonly timestampGenerator: TimestampGenerator;
  readonly scopeManager: ScopeManager;

  /**
   * Create a new pULID generator
   * @param {Object} options - Generator configuration
   * @param {number} [options.defaultScope=0] - Default scope for generated pULIDs
   * @param {boolean} [options.validateScope=true] - Whether to validate scopes
   * @param {EntropyGenerator} [options.entropyGenerator] - Custom entropy generator
   * @param {TimestampGenerator} [options.timestampGenerator] - Custom timestamp generator
   * @param {ScopeManager} [options.scopeManager] - Custom scope manager
   */
  constructor(options: GeneratorOptions = {}) {
    this.defaultScope = options.defaultScope ?? 1;
    this.validateScope = options.validateScope !== false;
    
    // Initialize generators
    this.entropyGenerator = options.entropyGenerator || new EntropyGenerator();
    this.timestampGenerator = options.timestampGenerator || new TimestampGenerator();
    this.scopeManager = options.scopeManager || new ScopeManager();
    
    // Validate default scope
    if (this.validateScope) {
      this.scopeManager.validate(this.defaultScope);
    }
  }

  /**
   * Generate a new pULID
   * @param {Object} options - Generation options
   * @param {number} [options.timestamp] - Custom timestamp (defaults to current time)
   * @param {number} [options.scope] - Custom scope (defaults to generator's default scope)
   * @param {Uint8Array} [options.entropy] - Custom entropy (defaults to random generation)
   * @returns {pULID} New pULID instance
   */
  generate(options: GenerateOptions = {}): pULID {
    const timestamp = options.timestamp ?? this.timestampGenerator.generate();
    const scope = options.scope !== undefined ? options.scope : this.defaultScope;
    const entropy = options.entropy ?? this.entropyGenerator.generate();

    // Validate scope if validation is enabled
    if (this.validateScope) {
      this.scopeManager.validate(scope);
    }

    return new pULID(timestamp, scope, entropy);
  }

  /**
   * Generate a pULID string (ULID format)
   * @param {Object} options - Generation options
   * @returns {string} 26-character ULID string
   */
  generateString(options: GenerateOptions = {}): string {
    return this.generate(options).toString();
  }

  /**
   * Generate a pULID in UUID format
   * @param {Object} options - Generation options
   * @returns {string} UUID string
   */
  generateUUID(options: GenerateOptions = {}): string {
    return this.generate(options).toUUID();
  }

  /**
   * Generate multiple pULIDs
   * @param {number} count - Number of pULIDs to generate
   * @param {Object} options - Generation options
   * @returns {pULID[]} Array of pULID instances
   */
  generateBatch(count: number, options: GenerateOptions = {}): pULID[] {
    if (typeof count !== 'number' || count < 1) {
      throw new pULIDError(`Invalid count: ${count}. Must be a positive number`);
    }

    const results: pULID[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.generate(options));
    }
    return results;
  }

  /**
   * Generate multiple pULID strings
   * @param {number} count - Number of pULIDs to generate
   * @param {Object} options - Generation options
   * @returns {string[]} Array of ULID strings
   */
  generateBatchStrings(count: number, options: GenerateOptions = {}): string[] {
    return this.generateBatch(count, options).map(pulid => pulid.toString());
  }

  /**
   * Generate pULID with a specific timestamp
   * @param {number|Date|string} timestamp - Timestamp (milliseconds, Date object, or ISO string)
   * @param {Object} options - Additional generation options
   * @returns {pULID} New pULID instance
   */
  generateAt(timestamp: number | Date | string, options: GenerateOptions = {}): pULID {
    let ts: number;
    
    if (typeof timestamp === 'number') {
      ts = timestamp;
    } else if (timestamp instanceof Date) {
      ts = timestamp.getTime();
    } else if (typeof timestamp === 'string') {
      ts = new Date(timestamp).getTime();
    } else {
      throw new pULIDError(`Invalid timestamp type: ${typeof timestamp}`);
    }

    return this.generate({
      ...options,
      timestamp: ts
    });
  }

  /**
   * Set the default scope for this generator
   * @param {number} scope - New default scope
   */
  setDefaultScope(scope: number): void {
    if (this.validateScope) {
      this.scopeManager.validate(scope);
    }
    this.defaultScope = scope;
  }

  /**
   * Get the current default scope
   * @returns {number} Current default scope
   */
  getDefaultScope(): number {
    return this.defaultScope;
  }

  /**
   * Get generator configuration
   * @returns {Object} Current configuration
   */
  getConfig(): GeneratorConfig {
    // If defaultScope is 0, report MAX_SCOPE in the configuration
    const reportedScope = this.defaultScope === 0 ? 65535 : this.defaultScope;

    return {
      defaultScope: reportedScope,
      originalScope: this.defaultScope, // Add original scope for debugging
      validateScope: this.validateScope,
      scopeInfo: this.scopeManager.getScopeInfo(),
      timestampInfo: this.timestampGenerator.getTimestampInfo()
    };
  }
}

/**
 * Create a scoped generator for a specific scope
 * @param {number} scope - Scope value for the generator
 * @param {Object} options - Additional generator options
 * @returns {pULIDGenerator} New generator with the specified default scope
 */
export function createScopedGenerator(scope: number, options: GeneratorOptions = {}): pULIDGenerator {
  return new pULIDGenerator({
    ...options,
    defaultScope: scope
  });
}

/**
 * Default pULID generator instance
 */
export const defaultGenerator = new pULIDGenerator();

/**
 * Generate a pULID using the default generator
 * @param {Object} options - Generation options
 * @returns {pULID} New pULID instance
 */
export function generate(options: GenerateOptions = {}): pULID {
  return defaultGenerator.generate(options);
}

/**
 * Generate a pULID string using the default generator
 * @param {Object} options - Generation options
 * @returns {string} ULID string
 */
export function generateString(options: GenerateOptions = {}): string {
  return defaultGenerator.generateString(options);
}

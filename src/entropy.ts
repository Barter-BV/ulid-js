/**
 * Entropy generation for pULID
 * Generates 8 bytes of cryptographically secure random data
 */

import { pULIDEntropyError } from './errors';

type RandomBytes = (length: number) => Uint8Array;

/**
 * Cross-platform entropy generator
 * Supports both browser (crypto.getRandomValues) and Node.js (crypto.randomBytes)
 */
export class EntropyGenerator {
  private readonly getRandomBytes: RandomBytes;

  constructor() {
    this.getRandomBytes = this.initRandomSource();
  }

  /**
   * Generate 8 bytes of cryptographically secure entropy
   * @returns {Uint8Array} 8 bytes of random data
   */
  generate(): Uint8Array {
    try {
      return this.getRandomBytes(8);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new pULIDEntropyError(`Failed to generate entropy: ${message}`);
    }
  }

  /**
   * Initialize the appropriate random source based on environment
   * @returns {Function} Function that generates random bytes
   * @private
   */
  private initRandomSource(): RandomBytes {
    if (globalThis.crypto?.getRandomValues) {
      return (length: number) => {
        const bytes = new Uint8Array(length);
        globalThis.crypto.getRandomValues(bytes);
        return bytes;
      };
    }

    throw new pULIDEntropyError('No secure random number generator available');
  }

  /**
   * Generate multiple entropy values at once
   * @param {number} count - Number of entropy values to generate
   * @returns {Uint8Array[]} Array of entropy byte arrays
   */
  generateBatch(count: number): Uint8Array[] {
    const results: Uint8Array[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.generate());
    }
    return results;
  }

  /**
   * Test if entropy generation is working
   * @returns {boolean} True if entropy generation is functional
   */
  test(): boolean {
    try {
      const entropy1 = this.generate();
      const entropy2 = this.generate();
      
      // Check that we got 8 bytes each
      if (entropy1.length !== 8 || entropy2.length !== 8) {
        return false;
      }
      
      // Check that the values are different (extremely unlikely to be the same)
      const same = entropy1.every((byte, index) => byte === entropy2[index]);
      return !same;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Default entropy generator instance
 */
export const defaultEntropyGenerator = new EntropyGenerator();

/**
 * Generate 8 bytes of entropy using the default generator
 * @returns {Uint8Array} 8 bytes of random data
 */
export function generateEntropy(): Uint8Array {
  return defaultEntropyGenerator.generate();
}

/**
 * Test entropy generation functionality
 * @returns {boolean} True if entropy generation works
 */
export function testEntropy(): boolean {
  return defaultEntropyGenerator.test();
}

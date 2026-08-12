import { decodeBase32, encodeBase32 } from './encoding';
import { EntropyGenerator, generateEntropy, testEntropy } from './entropy';
import {
  pULIDEntropyError,
  pULIDError,
  pULIDParseError,
  pULIDScopeError,
  pULIDTimestampError,
  pULIDUUIDError
} from './errors';
import { createScopedGenerator, defaultGenerator, pULIDGenerator } from './generator';
import { pULID } from './pulid';
import { bytesToScope, isValidScope, ScopeManager, scopeToBytes, validateScope } from './scope';
import { bytesToTimestamp, isValidTimestamp, TimestampGenerator, timestampToBytes, validateTimestamp } from './timestamp';
import type { GenerateOptions, GeneratorOptions, SelfTestResult } from './types';
import { createUUID, formatAsUUID, isValidUUID, UUIDConverter, uuidToBytes, validateUUID } from './uuid';

export function pulid(options: GenerateOptions = {}): string {
  return defaultGenerator.generateString(options);
}

export function generate(options: GenerateOptions = {}): pULID {
  return defaultGenerator.generate(options);
}

export function parse(value: string): pULID {
  return pULID.parse(value);
}

export function isValid(value: string): boolean {
  return pULID.isValid(value);
}

export function compare(pulid1: string, pulid2: string): number {
  return pulid1.localeCompare(pulid2);
}

export function scopedGenerator(scope: number, options: GeneratorOptions = {}): pULIDGenerator {
  return createScopedGenerator(scope, options);
}

export function test(): SelfTestResult {
  const results: SelfTestResult = {
    entropy: testEntropy(),
    parsing: false,
    uuid: false,
    overall: false
  };

  try {
    const testPulid = generate({ scope: 100 });
    const parsed = parse(testPulid.toString());
    results.parsing = parsed.getScope() === 100;

    const uuid = testPulid.toUUID();
    const fromUuid = pULID.fromUUID(uuid);
    results.uuid = fromUuid.equals(testPulid);
  } catch (error: unknown) {
    results.error = error instanceof Error ? error.message : String(error);
  }

  results.overall = results.entropy && results.parsing && results.uuid;
  return results;
}

export {
  EntropyGenerator,
  ScopeManager,
  TimestampGenerator,
  UUIDConverter,
  bytesToScope,
  bytesToTimestamp,
  createScopedGenerator,
  createUUID,
  decodeBase32,
  defaultGenerator,
  encodeBase32,
  formatAsUUID,
  generateEntropy,
  isValidScope,
  isValidTimestamp,
  isValidUUID,
  pULID,
  pULIDEntropyError,
  pULIDError,
  pULIDGenerator,
  pULIDParseError,
  pULIDScopeError,
  pULIDTimestampError,
  pULIDUUIDError,
  scopeToBytes,
  testEntropy,
  timestampToBytes,
  uuidToBytes,
  validateScope,
  validateTimestamp,
  validateUUID
};

export type {
  GenerateOptions,
  GeneratorConfig,
  GeneratorOptions,
  PULIDJSON,
  ScopeInfo,
  SelfTestResult,
  TimestampInfo
} from './types';

export default pulid;

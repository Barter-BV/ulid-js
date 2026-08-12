import type { EntropyGenerator } from './entropy';
import type { ScopeManager } from './scope';
import type { TimestampGenerator } from './timestamp';

export interface GenerateOptions {
  timestamp?: number;
  scope?: number;
  entropy?: Uint8Array;
}

export interface GeneratorOptions {
  defaultScope?: number;
  validateScope?: boolean;
  entropyGenerator?: EntropyGenerator;
  timestampGenerator?: TimestampGenerator;
  scopeManager?: ScopeManager;
}

export interface ScopeInfo {
  min: number;
  max: number;
  protected: number[];
  available: number;
}

export interface TimestampInfo {
  min: number;
  max: number;
  maxDate: Date;
  current: number;
  currentDate: Date;
}

export interface GeneratorConfig {
  defaultScope: number;
  originalScope: number;
  validateScope: boolean;
  scopeInfo: ScopeInfo;
  timestampInfo: TimestampInfo;
}

export interface PULIDJSON {
  timestamp: number;
  scope: number;
  entropy: number[];
  ulid: string;
  uuid: string;
  date: string;
}

export interface SelfTestResult {
  entropy: boolean;
  parsing: boolean;
  uuid: boolean;
  overall: boolean;
  error?: string;
}

# Barter pULID for TypeScript
<p align="left">Typed pULID generation for Node.js, compatible with the Barter/Pixie Go implementation and distributed through GitHub Packages.</p>

<p align="center">
  <a href="https://github.com/Barter-BV/ulid-ts/actions/workflows/test.yml"><img src="https://github.com/Barter-BV/ulid-ts/actions/workflows/test.yml/badge.svg" alt="TypeScript build and test suite"></a>
  <a href="https://github.com/Barter-BV/ulid-ts/actions/workflows/release.yml"><img src="https://github.com/Barter-BV/ulid-ts/actions/workflows/release.yml/badge.svg" alt="GitHub Packages release"></a>
  <a href="https://www.conventionalcommits.org/"><img src="https://img.shields.io/badge/Conventional_Commits-1.0.0-fe5196.svg" alt="Conventional Commits 1.0.0"></a>
  <img src="https://img.shields.io/badge/ulid/ts-2.0.0-6B7280" alt="ulid-ts version 2.0.0">
  <img src="https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white" alt="TypeScript 7.0.2">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=nodedotjs&logoColor=white" alt="Node.js 20 or newer">
  <img src="https://img.shields.io/badge/module-CommonJS-F7DF1E?logo=javascript&logoColor=111827" alt="CommonJS module">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-22C55E" alt="MIT license"></a>
</p>

---

## 1. OVERVIEW

`@barter-bv/ulid-ts` is a strict TypeScript 7 library for creating sortable 128-bit identifiers containing a timestamp, scope, and cryptographically secure entropy. It publishes CommonJS JavaScript, generated declaration files, declaration maps, and source maps.

### Versions at a glance

| Tool or package | Repository value | Source |
|---|---:|---|
| Package | 2.0.0 | [`package.json`](./package.json) |
| Node.js | `>=20.0.0` | [`package.json`](./package.json) |
| TypeScript | 7.0.2 | [`package-lock.json`](./package-lock.json) |
| Node.js types | 24.13.3 resolved | [`package-lock.json`](./package-lock.json) |
| Module output | CommonJS | [`tsconfig.json`](./tsconfig.json) |
| Package registry | GitHub Packages | [`package.json`](./package.json) |

### Identifier layout

Each pULID contains 16 bytes:

```text
  6 bytes       2 bytes       8 bytes
| timestamp | | scope | | secure entropy |
```

The 16 bytes can be represented as either:

- A 26-character Crockford Base32 ULID string
- A 36-character UUID-formatted string

Properties:

- Millisecond timestamp precision
- Numeric scopes from 1 through 65535
- Input scope `0` maps to scope `65535` for Go compatibility
- Lexicographically sortable by timestamp
- Cryptographically secure entropy from Web Crypto
- Round-trip conversion between ULID, UUID, and bytes

---

## 2. QUICK START

### Requirements

| Requirement | Version or access | Notes |
|---|---|---|
| Node.js | 20 or newer | The package engine floor is `>=20.0.0`. |
| npm | Included with Node.js | Used for installation, builds, tests, and releases. |
| GitHub token | `GITHUB_TOKEN` | Requires `read:packages` access for installation. |

### Install from GitHub Packages

Configure npm to resolve the `@barter-bv` scope through GitHub Packages:

```ini
@barter-bv:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Export a token with `read:packages` permission and install the package:

```shell
export GITHUB_TOKEN="<github-token>"
npm install @barter-bv/ulid-ts
```

### Generate an identifier

```typescript
import { pulid } from '@barter-bv/ulid-ts';

const id = pulid({ scope: 567 });
console.log(id);
```

---

## 3. TYPESCRIPT SUPPORT

Type declarations are generated from the source during the build and published at `dist/index.d.ts`. TypeScript resolves them automatically through the package `types` and `exports` fields. No separate `@types` package is required.

The public types include:

- `GenerateOptions`
- `GeneratorOptions`
- `GeneratorConfig`
- `PULIDJSON`
- `ScopeInfo`
- `TimestampInfo`
- `SelfTestResult`

### Generate and parse

```typescript
import { pulid, parse, type GenerateOptions, type pULID } from '@barter-bv/ulid-ts';

const options: GenerateOptions = {
  scope: 567,
  timestamp: Date.now()
};

const id: string = pulid(options);
const parsed: pULID = parse(id);

console.log(parsed.toString());
console.log(parsed.getScope());
console.log(parsed.getTimestamp());
console.log(parsed.getTime());
```

`pulid()` returns a string. Use `generate()` when an instance is needed directly:

```typescript
import { generate, type pULID } from '@barter-bv/ulid-ts';

const id: pULID = generate({ scope: 200 });

console.log(id.toString());
console.log(id.toUUID());
console.log(id.toBytes());
```

### UUID and byte conversion

```typescript
import { pULID } from '@barter-bv/ulid-ts';

const original = pULID.generate({ scope: 300 });

const fromUuid = pULID.fromUUID(original.toUUID());
const fromBytes = pULID.fromBytes(original.toBytes());

console.log(fromUuid.equals(original)); // true
console.log(fromBytes.equals(original)); // true
```

### Scoped generators

Use `scopedGenerator()` when multiple identifiers share the same default scope:

```typescript
import {
  scopedGenerator,
  type GenerateOptions,
  type pULIDGenerator
} from '@barter-bv/ulid-ts';

const generator: pULIDGenerator = scopedGenerator(567);

const id: string = generator.generateString();
const uuid: string = generator.generateUUID();
const batch: string[] = generator.generateBatchStrings(10);

const override: GenerateOptions = { scope: 1000 };
const overriddenId = generator.generateString(override);
```

A generator can also produce identifiers for a specific time:

```typescript
import { pULIDGenerator } from '@barter-bv/ulid-ts';

const generator = new pULIDGenerator({ defaultScope: 200 });

const fromDate = generator.generateAt(new Date('2026-01-01T00:00:00Z'));
const fromIso = generator.generateAt('2026-01-01T00:00:00Z');
const fromTimestamp = generator.generateAt(1767225600000);
```

### Custom entropy

Generation options accept exactly eight entropy bytes. This is useful for deterministic tests and cross-language compatibility fixtures:

```typescript
import { pulid, type GenerateOptions } from '@barter-bv/ulid-ts';

const options: GenerateOptions = {
  timestamp: 1738019888350,
  scope: 200,
  entropy: new Uint8Array([0xae, 0xc6, 0x79, 0x0f, 0xd8, 0xfc, 0xde, 0x19])
};

const id = pulid(options);
```

### Validation and errors

```typescript
import {
  isValid,
  parse,
  pULIDParseError,
  pULIDScopeError
} from '@barter-bv/ulid-ts';

if (isValid('01JJN1AD5B08VJ5SRBJAWCBWDQ')) {
  const parsed = parse('01JJN1AD5B08VJ5SRBJAWCBWDQ');
  console.log(parsed.getScope());
}

try {
  parse('invalid');
} catch (error: unknown) {
  if (error instanceof pULIDParseError) {
    console.error(error.message);
  }
}

try {
  pulid({ scope: 65536 });
} catch (error: unknown) {
  if (error instanceof pULIDScopeError) {
    console.error(error.message);
  }
}
```

### JSON representation

```typescript
import { generate, type PULIDJSON } from '@barter-bv/ulid-ts';

const value: PULIDJSON = generate({ scope: 200 }).toJSON();

console.log(value.ulid);
console.log(value.uuid);
console.log(value.timestamp);
console.log(value.scope);
console.log(value.entropy);
console.log(value.date);
```

---

## 4. JAVASCRIPT USAGE

The runtime package is CommonJS and can be loaded with `require()`:

```javascript
const {
  pulid,
  parse,
  pULIDGenerator
} = require('@barter-bv/ulid-ts');

const id = pulid({ scope: 567 });
const parsed = parse(id);
const generator = new pULIDGenerator({ defaultScope: 200 });

console.log(parsed.toUUID());
console.log(generator.generateString());
```

---

## 5. API REFERENCE

| Export | Description |
|---|---|
| `pulid(options?)` | Generate a 26-character pULID string. |
| `generate(options?)` | Generate a `pULID` instance. |
| `parse(value)` | Parse a pULID string into a `pULID` instance. |
| `isValid(value)` | Return whether a string is a valid pULID. |
| `compare(a, b)` | Compare two pULID strings lexicographically. |
| `scopedGenerator(scope, options?)` | Create a generator with a default scope. |
| `pULID` | Core identifier class with parsing and conversion methods. |
| `pULIDGenerator` | Configurable generator class. |

Lower-level encoding, timestamp, scope, UUID, entropy, and error utilities are also exported with generated declarations.

---

## 6. DEVELOPMENT

### Common commands

| Task | Command |
|---|---|
| Install exact dependencies | `npm ci` |
| Type-check without emitting | `npm run typecheck` |
| Build `dist/` | `npm run build` |
| Run the full suite | `npm test` |
| Run runtime compatibility tests | `npm run test:runtime` |
| Compile the typed consumer fixture | `npm run test:types` |
| Inspect package contents | `npm pack --dry-run` |

```shell
npm ci
npm run typecheck
npm test
npm pack --dry-run
```

The test command performs a clean TypeScript build, runs the JavaScript compatibility suite against `dist/`, and compiles a TypeScript consumer fixture against the published declarations.

---

## 7. PUBLISHING

The GitHub Actions release workflow uses the `GH_PACKAGES_TOKEN` secret. The token requires `write:packages` access to the `Barter-BV` organization.

For a manual release:

```shell
export GH_PACKAGES_TOKEN="<github-token>"
npm run release
```

Publishing performs a clean build, runtime tests, TypeScript consumer validation, and package-content inspection before uploading the current version to GitHub Packages.

---

## 8. PROVENANCE AND THANKS

This repository is based on the original [`Pixie-sh/ulid-js`](https://github.com/Pixie-sh/ulid-js) implementation, which in turn follows [`Pixie-sh/ulid-go`](https://github.com/Pixie-sh/ulid-go). This fork preserves cross-language pULID compatibility while adding strict TypeScript support, generated declarations, and GitHub Packages distribution for Barter.

Special thanks to the projects that informed and inspired the original implementations:

- [`github.com/google/uuid`](https://github.com/google/uuid)
- [`github.com/matoous/go-nanoid/v2`](https://github.com/matoous/go-nanoid)
- [`github.com/oklog/ulid`](https://github.com/oklog/ulid)
- [`github.com/RobThree/NUlid`](https://github.com/RobThree/NUlid)
- [`github.com/segmentio/ksuid`](https://github.com/segmentio/ksuid)

---

## 9. LICENSE

This project is available under the [MIT License](./LICENSE).

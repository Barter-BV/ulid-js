# @barter-bv/ulid-js

A typed pULID implementation compatible with the Barter/Pixie Go implementation. A pULID is a sortable 128-bit identifier containing a timestamp, scope, and cryptographically secure entropy.

The library is written in strict TypeScript 7 and publishes CommonJS JavaScript with generated declaration files and source maps.

## Requirements

- Node.js 20 or newer
- TypeScript is optional for consumers
- Access to the `Barter-BV` GitHub Packages registry

## Identifier Layout

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

## Installation

Configure npm to resolve the `@barter-bv` scope through GitHub Packages:

```ini
@barter-bv:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Export a token with `read:packages` permission and install the package:

```shell
export GITHUB_TOKEN="<github-token>"
npm install @barter-bv/ulid-js
```

## TypeScript Support

Type declarations are generated from the source during the build and published at `dist/index.d.ts`. TypeScript resolves them automatically through the package `types` and `exports` fields. No separate `@types` package is required.

The public types include:

- `GenerateOptions`
- `GeneratorOptions`
- `GeneratorConfig`
- `PULIDJSON`
- `ScopeInfo`
- `TimestampInfo`
- `SelfTestResult`

### Generate And Parse

```typescript
import { pulid, parse, type GenerateOptions, type pULID } from '@barter-bv/ulid-js';

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
import { generate, type pULID } from '@barter-bv/ulid-js';

const id: pULID = generate({ scope: 200 });

console.log(id.toString());
console.log(id.toUUID());
console.log(id.toBytes());
```

### UUID And Byte Conversion

```typescript
import { pULID } from '@barter-bv/ulid-js';

const original = pULID.generate({ scope: 300 });

const fromUuid = pULID.fromUUID(original.toUUID());
const fromBytes = pULID.fromBytes(original.toBytes());

console.log(fromUuid.equals(original)); // true
console.log(fromBytes.equals(original)); // true
```

### Scoped Generators

Use `scopedGenerator()` when multiple identifiers share the same default scope:

```typescript
import {
  scopedGenerator,
  type GenerateOptions,
  type pULIDGenerator
} from '@barter-bv/ulid-js';

const generator: pULIDGenerator = scopedGenerator(567);

const id: string = generator.generateString();
const uuid: string = generator.generateUUID();
const batch: string[] = generator.generateBatchStrings(10);

const override: GenerateOptions = { scope: 1000 };
const overriddenId = generator.generateString(override);
```

A generator can also produce identifiers for a specific time:

```typescript
import { pULIDGenerator } from '@barter-bv/ulid-js';

const generator = new pULIDGenerator({ defaultScope: 200 });

const fromDate = generator.generateAt(new Date('2026-01-01T00:00:00Z'));
const fromIso = generator.generateAt('2026-01-01T00:00:00Z');
const fromTimestamp = generator.generateAt(1767225600000);
```

### Custom Entropy

Generation options accept exactly eight entropy bytes. This is useful for deterministic tests and cross-language compatibility fixtures:

```typescript
import { pulid, type GenerateOptions } from '@barter-bv/ulid-js';

const options: GenerateOptions = {
  timestamp: 1738019888350,
  scope: 200,
  entropy: new Uint8Array([0xae, 0xc6, 0x79, 0x0f, 0xd8, 0xfc, 0xde, 0x19])
};

const id = pulid(options);
```

### Validation And Errors

```typescript
import {
  isValid,
  parse,
  pULIDParseError,
  pULIDScopeError
} from '@barter-bv/ulid-js';

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

### JSON Representation

```typescript
import { generate, type PULIDJSON } from '@barter-bv/ulid-js';

const value: PULIDJSON = generate({ scope: 200 }).toJSON();

console.log(value.ulid);
console.log(value.uuid);
console.log(value.timestamp);
console.log(value.scope);
console.log(value.entropy);
console.log(value.date);
```

## JavaScript Usage

The runtime package is CommonJS and can be loaded with `require()`:

```javascript
const {
  pulid,
  parse,
  pULIDGenerator
} = require('@barter-bv/ulid-js');

const id = pulid({ scope: 567 });
const parsed = parse(id);
const generator = new pULIDGenerator({ defaultScope: 200 });

console.log(parsed.toUUID());
console.log(generator.generateString());
```

## Main API

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

## Development

```shell
npm install
npm run typecheck
npm test
npm pack --dry-run
```

The test command performs a clean TypeScript build, runs the JavaScript compatibility suite against `dist/`, and compiles a TypeScript consumer fixture against the published declarations.

## Publishing

The GitHub Actions release workflow uses the `GH_PACKAGES_TOKEN` secret. The token requires `write:packages` access to the `Barter-BV` organization.

For a manual release:

```shell
export GH_PACKAGES_TOKEN="<github-token>"
npm run release
```

## License

MIT

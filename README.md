# 🔒 sealenv

> **Validate, type-check, and secure your environment variables — zero dependencies on dotenv.**

[![npm version](https://img.shields.io/npm/v/sealenv.svg)](https://www.npmjs.com/package/sealenv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v/sealenv.svg)](https://nodejs.org/)
[![CI](https://github.com/Anish-530/env-guardian/actions/workflows/ci.yml/badge.svg)](https://github.com/Anish-530/env-guardian/actions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/sealenv)](https://bundlephobia.com/package/sealenv)

---

## Why sealenv?

Most env validators just check if variables exist. **sealenv** goes further:

| Feature | sealenv | envalid | t3-env | zod (manual) |
|---|:---:|:---:|:---:|:---:|
| Schema validation | ✅ | ✅ | ✅ | ✅ |
| Type coercion | ✅ | ✅ | ✅ | ✅ |
| **Prototype pollution detection** | ✅ | ❌ | ❌ | ❌ |
| **Secret masking in errors** | ✅ | ❌ | ❌ | ❌ |
| **Weak secret warnings** | ✅ | ❌ | ❌ | ❌ |
| **CI-ready CLI** | ✅ | ❌ | ❌ | ❌ |
| **Auto-generate schema from .env** | ✅ | ❌ | ❌ | ❌ |
| TypeScript generation | ✅ | ✅ | ✅ | ✅ |
| Zero-config | ✅ | ✅ | ❌ | ❌ |
| Lightweight (1 dep) | ✅ | ✅ | ❌ | ❌ |

---

## Quick Start

```bash
npm install sealenv
```

```javascript
import { loadAndValidate } from 'sealenv';

const env = loadAndValidate({
  PORT: { type: 'port', required: true, default: 3000 },
  DATABASE_URL: { type: 'url', required: true },
  NODE_ENV: { type: 'string', allowedValues: ['development', 'production'] },
});

// env.PORT is a number, env.DATABASE_URL is a validated URL string
```

That's it. If anything is wrong, your app crashes immediately with a clear, actionable error — never leaking secrets.

---

## Features

### 🔒 Security First

sealenv actively protects your application:

- **Prototype pollution detection** — blocks `__proto__`, `constructor`, and `prototype` keys in `.env` files and runtime
- **Secret masking** — error messages for sensitive keys (passwords, tokens, API keys) never expose the actual value
- **Weak secret warnings** — warns when secrets are too short or look like defaults
- **Secret pattern detection** — recognizes GitHub tokens (`ghp_`), Stripe keys (`sk_live_`), AWS keys, PEM private keys, and more

```javascript
try {
  const env = loadAndValidate(schema);
} catch (error) {
  console.error(error.message);
  // "Invalid value for DB_PASSWORD (value masked for security)"
  // ✅ The actual password never appears in logs or error trackers
}
```

### ✅ Rich Type Validation

Built-in validators for common patterns:

| Type | Validates | Returns |
|---|---|---|
| `string` | Any string | `string` |
| `number` | Valid numbers | `number` |
| `boolean` | `true/false`, `1/0`, `yes/no`, `on/off` | `boolean` |
| `url` | Valid URLs (http, https) | `string` |
| `port` | Integers 1–65535 | `number` |
| `email` | Email format | `string` |
| `json` | Valid JSON strings | `unknown` (parsed object) |

```javascript
const env = loadAndValidate({
  PORT: { type: 'port', required: true },
  API_URL: { type: 'url', required: true },
  ADMIN_EMAIL: { type: 'email' },
  FEATURE_FLAGS: { type: 'json', default: '{}' },
  DEBUG: { type: 'boolean', default: false },
});
```

### 🛡️ Schema Rules

Each variable supports:

```javascript
{
  type: 'string',           // Type validator (see table above)
  required: true,           // Fail if missing or empty
  default: 'fallback',      // Applied when variable is undefined
  allowedValues: ['a', 'b'] // Restrict to specific values
}
```

---

## CLI Tool

Verify your environment directly from the terminal — perfect for CI/CD pipelines.

### Validate

```bash
npx sealenv
```

```text
🔒 sealenv v2.0
=======================

✅ Success: Environment is valid and secure.
   4 variables checked, 0 warnings.
```

### Generate Schema from .env

Scan your existing `.env` file and auto-generate an `env-schema.json`:

```bash
npx sealenv --init
```

```text
🔒 sealenv v2.0
=======================

✅ Generated env-schema.json with 4 variables.

  Review the schema and adjust types/required fields as needed.
  Then run npx sealenv to validate.
```

### Generate TypeScript Definitions

```bash
npx sealenv --types
```

Generates an `env.d.ts` file from your `env-schema.json` for IDE autocompletion.

---

## API Reference

### `loadAndValidate(schema, options?)`

Loads `.env`, merges with `process.env`, runs security checks, and validates.

```javascript
import { loadAndValidate } from 'sealenv';

const env = loadAndValidate(schema, {
  path: './config/.env.production', // Custom .env path (default: '.env')
  skipDotenv: true,                 // Only validate process.env
});
```

### `validateEnv(schema, sourceEnv?)`

Validates an env object without loading from disk. Useful for testing.

```javascript
import { validateEnv } from 'sealenv';

const env = validateEnv(schema, { PORT: '3000', NODE_ENV: 'production' });
```

### `createEnvTypes(schema, outputDir?)`

Generates TypeScript definitions programmatically.

```javascript
import { createEnvTypes } from 'sealenv';

createEnvTypes(schema); // Writes env.d.ts to cwd
```

### `parseDotenv(filePath)`

Low-level parser with security checks built in.

```javascript
import { parseDotenv } from 'sealenv';

const vars = parseDotenv('.env');
```

### Error Classes

```javascript
import { EnvValidationError, EnvSecurityError } from 'sealenv';
```

---

## Real-World Example: Express

```javascript
// config.js
import { loadAndValidate } from 'sealenv';

export const env = loadAndValidate({
  PORT: { type: 'port', required: true, default: 3000 },
  NODE_ENV: { type: 'string', allowedValues: ['development', 'staging', 'production'], default: 'development' },
  DATABASE_URL: { type: 'url', required: true },
  JWT_SECRET: { type: 'string', required: true },
  CORS_ORIGIN: { type: 'url', default: 'http://localhost:3000' },
  LOG_LEVEL: { type: 'string', allowedValues: ['debug', 'info', 'warn', 'error'], default: 'info' },
});
```

```javascript
// server.js
import express from 'express';
import { env } from './config.js';

const app = express();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
```

If `DATABASE_URL` is missing or `JWT_SECRET` is weak, the server won't start — and the error won't leak your secret.

---

## GitHub Actions

Add sealenv to your CI pipeline:

```yaml
- name: Validate environment
  run: npx sealenv
  env:
    PORT: 3000
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Migrating from @awish/env-guardian

If you were using the v1 package:

```bash
npm uninstall @awish/env-guardian
npm install sealenv
```

```diff
-import { loadAndValidate } from '@awish/env-guardian';
+import { loadAndValidate } from 'sealenv';
```

New in v2:
- 4 new types: `url`, `port`, `email`, `json`
- CLI: `--init` and `--types` flags
- Full TypeScript definitions shipped
- Expanded secret detection (GitHub, Stripe, AWS patterns)

---

## Testing

```bash
npm test
```

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

[MIT](./LICENSE) © Anish Nayak

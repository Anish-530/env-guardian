# 🛡️ @awish/env-guardian

> A lightweight, highly secure environment variable validation library for Node.js.

[![npm version](https://img.shields.io/npm/v/@awish/env-guardian.svg)](https://www.npmjs.com/package/@awish/env-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node requirement](https://img.shields.io/node/v/@awish/env-guardian.svg)](https://nodejs.org/)

**env-guardian** enforces strict schemas on your `.env` files and runtime environment variables. It actively prevents prototype pollution, masks sensitive secrets from crash logs, provides interactive CLI tools, and generates static TypeScript definitions.

---

## ✨ Features (v1.1)

- **🔒 Security First:** Actively scans for prototype pollution attempts (`__proto__`, `constructor`) and limits payload sizes to prevent memory DoS attacks.
- **🤫 Secret Masking:** Automatically prevents sensitive keys (e.g., `PASSWORD`, `API_KEY`) from leaking in error traces and detects weak cryptographic strings.
- **🛡️ Type Safety (TypeScript):** Validate at runtime, and easily generate `.d.ts` type definitions for your IDE.
- **💻 Interactive CLI:** A fully chalk-colored terminal diagnostic tool to verify environments directly from CI/CD pipelines.

---

## 📦 Installation

```bash
npm install @awish/env-guardian
```

---

## 💻 Usage

Create a validation schema and pass it to `loadAndValidate()`. 

```javascript
import { loadAndValidate } from '@awish/env-guardian';

const schema = {
  PORT: { type: 'number', required: true, default: 3000 },
  NODE_ENV: { type: 'string', allowedValues: ['development', 'production'] },
  SUPER_SECRET_KEY: { type: 'string', required: true },
  ENABLE_BETA: { type: 'boolean', default: false }
};

const env = loadAndValidate(schema);

console.log(typeof env.PORT); // Guaranteed valid number
```

### Advanced Security Validation
The system proactively identifies architectural risks on load:
```text
⚠️  Weak secret detected for JWT_SECRET
⚠️  API_KEY looks like a real secret
```

---

## ⌨️ TypeScript Generation

**env-guardian** can dynamically generate an `env.d.ts` file based on your runtime schema so your IDE possesses full IntelliSense auto-complete.

```javascript
import { createEnvTypes } from '@awish/env-guardian';

const schema = { PORT: { type: 'number', required: true } };

// Generates `env.d.ts` in your current working directory
createEnvTypes(schema); 
```

---

## 🖥 CLI Tool

Verify your `.env` configuration instantly via the terminal. Create a JSON schema file (`env-schema.json`), then run:

```bash
npx @awish/env-guardian
```

Outputs a cleanly formatted summary:
```text
🛡️  ENV GUARDIAN v1.1
=======================

✅ Success: Environment configuration is valid and secure.
```

---

## 🧪 Testing

```bash
npm test
```

## 📄 License
MIT License

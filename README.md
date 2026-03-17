# 🛡️ @awish/env-guardian

> A lightweight, highly secure environment variable validation library for Node.js.

[![npm version](https://img.shields.io/npm/v/@awish/env-guardian.svg)](https://www.npmjs.com/package/@awish/env-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node requirement](https://img.shields.io/node/v/@awish/env-guardian.svg)](https://nodejs.org/)
[![visitors](https://visitor-badge.laobi.icu/badge?page_id=https://github.com/Anish-530/env-guardian)](https://www.npmjs.com/package/@awish/env-guardian)

**env-guardian** enforces strict schemas on your `.env` files and runtime environment variables. It actively prevents prototype pollution, masks sensitive secrets from crash logs, provides interactive CLI tools, and generates static TypeScript definitions.

---

## ✨ Features (v1.1)

- **🔒 Security First:** Actively scans for prototype pollution attempts (`__proto__`, `constructor`) and limits payload sizes to prevent memory DoS attacks.
- **🤫 Secret Masking:** Automatically prevents sensitive keys (e.g., `PASSWORD`, `API_KEY`) from leaking in error traces and detects weak cryptographic strings.
- **🛡️ Type Safety (TypeScript):** Validate at runtime, and easily generate `.d.ts` type definitions for your IDE.
- **✅ Schema Validation:** Enforce `required` variables, apply `default` fallbacks, and restrict to `allowedValues`.
- **💻 Interactive CLI:** A fully chalk-colored terminal diagnostic tool to verify environments directly from CI/CD pipelines.

---

## 📦 Installation

To install the package, run the following command in your project directory:

```bash
npm install @awish/env-guardian
```

---

## 💻 Usage

Create a validation schema and pass it to `loadAndValidate()`. If the validation fails, it throws an early, descriptive error—preventing your app from running in a broken state.

### 1. Basic Example

```javascript
import { loadAndValidate } from '@awish/env-guardian';

// Define how your environment should look
const schema = {
  PORT: { 
    type: 'number', 
    required: true, 
    default: 3000 
  },
  NODE_ENV: { 
    type: 'string', 
    allowedValues: ['development', 'staging', 'production'],
    default: 'development'
  },
  SUPER_SECRET_KEY: { 
    type: 'string', 
    required: true 
  },
  ENABLE_FEATURE_X: { 
    type: 'boolean', 
    default: false 
  }
};

// Validate! 
// This automatically loads from '.env' by default and applies your schema
const env = loadAndValidate(schema);

// Your variables are now safely typed and guaranteed to be present
console.log(typeof env.PORT); // "number"
console.log(env.ENABLE_FEATURE_X); // true or false boolean
```

### 2. Error Handling & Secret Masking

If a developer configured something incorrectly, `env-guardian` provides clear errors. However, it will **never** leak secrets in the stack trace. The system also proactively identifies architectural risks on load via console warnings:

```javascript
// A developer accidentally typed `SUPER_SECRET_KEY=12345` instead of a strong password

try {
  const env = loadAndValidate(schema);
} catch (error) {
  console.error(error.message); 
  // Output: "Invalid value for SUPER_SECRET_KEY (value masked for security)"
}

// Console Warnings:
// ⚠️  Weak secret detected for SUPER_SECRET_KEY
```

---

## 🛠️ Configuration Options

The `loadAndValidate` method accepts an optional second argument for configuration:

```javascript
const env = loadAndValidate(schema, {
  path: './config/.env.production', // Load a custom file path
  skipDotenv: true,                 // Don't read from disk, just validate process.env
});
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

Verify your `.env` configuration instantly via the terminal perfect for CI/CD pipelines (like GitHub Actions). Create a JSON schema file (`env-schema.json`), then run:

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

To run the internal test suite:

```bash
npm test
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

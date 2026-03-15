# 🛡️ env-guardian

> A lightweight, zero-dependency, and highly secure environment variable validation library for Node.js.

[![npm version](https://img.shields.io/npm/v/env-guardian.svg)](https://www.npmjs.com/package/env-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node requirement](https://img.shields.io/node/v/env-guardian.svg)](https://nodejs.org/)

**env-guardian** enforces strict schemas on your `.env` files and runtime environment variables. It prevents prototype pollution, masks sensitive secrets from crash logs, and guarantees that your app never boots with missing or invalid configurations.

---

## ✨ Features

- **🔒 Security First:** Actively scans for prototype pollution attempts (`__proto__`, `constructor`) and blocks them.
- **🤫 Secret Masking:** Automatically prevents sensitive keys (e.g., `PASSWORD`, `API_KEY`, `TOKEN`) from leaking in error traces.
- **🛡️ Type Safety:** Casts string variables into actual booleans and numbers.
- **✅ Schema Validation:** Enforce `required` variables, apply `default` fallbacks, and restrict to `allowedValues`.
- **🚀 Zero Dependencies:** Tiny footprint. Built entirely with native Node.js APIs.
- **💻 CLI Included:** Verify your environments directly from the terminal or CI/CD pipelines.

---

## 📦 Installation

To install the package, run the following command in your project directory:

```bash
npm install env-guardian
```

*(Note: If the package name is scoped, replace this with `npm install @your-username/env-guardian`)*

---

## 💻 Usage

Create a validation schema and pass it to `loadAndValidate()`. If the validation fails, it throws an early, descriptive error—preventing your app from running in a broken state.

### 1. Basic Example

```javascript
import { loadAndValidate } from 'env-guardian';

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
  DB_PASSWORD: { 
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

If a developer configured something incorrectly, `env-guardian` provides clear errors. However, it will **never** leak secrets in the stack trace.

```javascript
// A developer accidentally typed `DB_PASSWORD=12345` instead of a string...

try {
  const env = loadAndValidate(schema);
} catch (error) {
  console.error(error.message); 
  // Output: "Invalid value for DB_PASSWORD (value masked for security)"
}
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

## 🖥 CLI Tool

Want to validate your `.env` without writing any code? **env-guardian** includes a terminal tool perfect for CI/CD pipelines (like GitHub Actions) to catch bad environment configurations before deployment.

1. Ensure you have an `env-schema.json` file in your root directory:
```json
{
  "PORT": { "type": "number", "required": true },
  "API_KEY": { "type": "string", "required": true }
}
```

2. Run the guardian:
```bash
npx env-guardian
```

**Output:**
```
✅ Environment configuration is valid and secure.
```
*(Will exit with code `1` and print errors if the configuration is invalid).*

---

## 🧪 Testing

To run the internal test suite:

```bash
npm test
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

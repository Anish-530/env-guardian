# env-guardian

A secure environment variable validation library for Node.js.

## Installation
\`\`\`bash
npm install env-guardian
\`\`\`

## Usage
\`\`\`javascript
import { loadAndValidate } from 'env-guardian';

const schema = {
  PORT: { type: 'number', required: true, default: 3000 },
  NODE_ENV: { type: 'string', allowedValues: ['development', 'production'] },
  SECRET_KEY: { type: 'string', required: true }
};

const env = loadAndValidate(schema);
console.log(env.PORT); // Guaranteed to be a number!
\`\`\`

## CLI Verification
You can use the CLI tool to verify your environment without coding. Ensure an `env-schema.json` is present.
\`\`\`bash
npx env-guardian
\`\`\`

## Security Features
- **Prototype Pollution Prevention:** Rejects malicious constructor keys.
- **Secrets Masking:** Sensitive keywords (e.g. `PASSWORD`) are completely omitted from logs and errors.
- **Immutability:** Avoids corrupting process state directly.

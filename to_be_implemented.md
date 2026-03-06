# Phase 1 — Project Architecture
## Prompt 1: Generate Package Structure
Writing

You are helping me build an npm package called env-guardian.

Goal:
Create a secure environment variable validation library for Node.js.

Important rules:

Only output code and folder structure.

Do NOT include explanations.

Code must be production-ready.

Use modern JavaScript (ESM).

Node version target: >=18.

Features required:

Validate environment variables from .env

Type validation (string, number, boolean)

Allowed values validation

Required variables

Default values

Clean error messages

Security protections

TypeScript support later

Generate the complete project structure including:

env-guardian/
src/
validator.js
parser.js
errors.js
types.js
security.js
index.js
tests/
package.json
README.md

Also generate package.json with:

proper exports

CLI support

MIT license

no unnecessary dependencies

# Phase 2 — Secure .env Parsing
## Prompt 2: Build the Parser
Writing

Generate the code for src/parser.js.

Requirements:

Parse .env files safely.

Prevent prototype pollution.

Ignore invalid lines.

Support comments (#).

Trim whitespace.

Handle quoted values.

Security requirements:

Prevent malicious key injection (proto, constructor).

Reject keys containing dangerous characters.

Validate maximum file size (1MB).

Avoid eval or dynamic execution.

Export function:

parseEnvFile(path)

Return:
{
KEY: "value"
}

Only output the code for parser.js.

# Phase 3 — Environment Validation Engine
## Prompt 3: Build Validator Core

This module validates environment variables against a schema.

Example schema:

validateEnv({
PORT: { type: "number", required: true },
NODE_ENV: { type: "string", allowed: ["development","production"] },
DEBUG: { type: "boolean", default: false }
})

Features required:

Type validation

Required variable detection

Default values

Allowed value checking

Automatic type conversion

Clear error messages

Security requirements:

Reject unknown schema types

Prevent prototype pollution

Freeze returned object

Do not mutate process.env

Export function:

validateEnv(schema)

Return validated env object.

Only output code for validator.js.

# Phase 4 — Error Handling
## Prompt 4: Secure Error System
Writing

Generate src/errors.js.

Requirements:

Create structured error classes:

EnvGuardianError
MissingVariableError
InvalidTypeError
InvalidValueError

Security requirements:

Do not expose sensitive env values in error messages.

Mask secrets such as:
PASSWORD
TOKEN
SECRET
API_KEY

Errors must display variable name but hide sensitive values.

Example output:

Invalid type for PORT (expected number)

Only output code for errors.js.

# Phase 5 — Security Module
## Prompt 5: Security Utilities
Writing

Generate src/security.js.

Purpose:
Security helpers used across the library.

Features:

Detect suspicious environment variable names

Block prototype pollution keys

Validate key format

Sanitize environment values

Prevent extremely large values (>10KB)

Security rules:

Block keys:

proto
constructor
prototype

Reject keys containing:

spaces
null bytes
control characters

Export functions:

validateKey(key)
sanitizeValue(value)
isSensitiveKey(key)

Only output code.

# Phase 6 — Main Entry File
## Prompt 6: Create Main API
Writing

Generate src/index.js.

Requirements:

Import modules:

parser
validator
security

Expose public API:

validateEnv(schema)
loadEnv(path)

Behavior:

loadEnv reads .env

validateEnv validates variables

Return immutable env object

Security requirements:

Never overwrite process.env

Freeze returned object

Validate schema before execution

Only output code.

# Phase 7 — CLI Tool
## Prompt 7: CLI Interface
Writing

Generate CLI tool bin/env-guardian.js.

Usage:

npx env-guardian

Behavior:

Read .env

Validate against config file

Print errors

Security requirements:

Never print sensitive values

Limit console output size

Exit with code 1 on failure

Output must be CLI-ready.

Only output code.

# Phase 8 — Security Tests
## Prompt 8: Generate Tests
Writing

Generate test cases for env-guardian.

Test cases must include:

Missing variables

Invalid types

Allowed values validation

Default values

Prototype pollution attempt

Oversized env values

Sensitive value masking

Use Node.js built-in test runner.

Only output code.

# Phase 9 — Documentation
## Prompt 9: README
Writing

Generate README.md.

Sections required:

Installation
Usage
Schema examples
Security features
CLI usage
TypeScript support
Best practices

Examples must be clear and minimal.

Only output markdown.
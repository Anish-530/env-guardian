import test from 'node:test';
import assert from 'node:assert';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { validateEnv } from '../src/validator.js';
import { checkSecurity } from '../src/security.js';
import { parseEnvFile } from '../src/parser.js';

test(chalk.cyan('Validator - Detects missing required variables'), () => {
    const schema = { PORT: { required: true } };
    assert.throws(() => validateEnv(schema, {}), /Missing required environment variable/);
});

test(chalk.cyan('Validator - Applies default values'), () => {
    const schema = { HOST: { default: 'localhost' } };
    const validated = validateEnv(schema, {});
    assert.strictEqual(validated.HOST, 'localhost');
});

test(chalk.cyan('Validator - Enforces invalid types'), () => {
    const schema = { PORT: { type: 'number' } };
    assert.throws(() => validateEnv(schema, { PORT: 'not_a_number' }), /Must be a valid number/);
});

test(chalk.cyan('Validator - Enforces allowed values'), () => {
    const schema = { NODE_ENV: { allowedValues: ['development', 'production'] } };
    assert.throws(() => validateEnv(schema, { NODE_ENV: 'testing' }), /Must be one of/);
});

test(chalk.magenta('Security - Detects prototype pollution keys in runtime'), () => {
    assert.throws(() => checkSecurity({ '__PROTO__': 'malicious' }), /Potentially dangerous environment variable/);
});

test(chalk.magenta('Security - Masks sensitive error messages'), () => {
    const schema = { DB_PASSWORD: { type: 'number' } }; 
    assert.throws(() => validateEnv(schema, { DB_PASSWORD: 'my_secret_password' }), /value masked for security/);
});

test(chalk.magenta('Security - Rejects oversized values during parse'), () => {
    // Create a temporary oversized file just for this test
    const tempFile = path.resolve(process.cwd(), 'tests', '.env.oversized');
    const largeString = 'a'.repeat((10 * 1024) + 1); // 1 byte over 10KB
    fs.writeFileSync(tempFile, `LARGE_KEY=${largeString}`);
    
    try {
        assert.throws(() => parseEnvFile('tests/.env.oversized'), /exceeds maximum allowed size of/);
    } finally {
        fs.unlinkSync(tempFile); // Cleanup
    }
});

import test from 'node:test';
import assert from 'node:assert';
import { validateEnv } from '../src/validator.js';
import { checkSecurity } from '../src/security.js';

test('Validator: Detects missing required variables', () => {
    const schema = { PORT: { required: true } };
    assert.throws(() => validateEnv(schema, {}), /Missing required environment variable/);
});

test('Validator: Applies default values', () => {
    const schema = { HOST: { default: 'localhost' } };
    const validated = validateEnv(schema, {});
    assert.strictEqual(validated.HOST, 'localhost');
});

test('Validator: Enforces allowed values', () => {
    const schema = { NODE_ENV: { allowedValues: ['development', 'production'] } };
    assert.throws(() => validateEnv(schema, { NODE_ENV: 'testing' }), /Must be one of/);
});

test('Security: Detects prototype pollution keys', () => {
    assert.throws(() => checkSecurity({ '__PROTO__': 'malicious' }), /potentially dangerous environment variable detected/i);
});

test('Security: Masks sensitive error messages', () => {
    const schema = { DB_PASSWORD: { type: 'number' } }; 
    assert.throws(() => validateEnv(schema, { DB_PASSWORD: 'my_secret_password' }), /value masked for security/);
});

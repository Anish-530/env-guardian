import { test } from 'node:test';
import assert from 'node:assert';
import { validateEnv } from '../src/validator.js';

test('validates string correctly', () => {
    const schema = { API_KEY: { type: 'string', required: true } };
    const env = { API_KEY: 'secret123' };
    const result = validateEnv(schema, env);
    assert.strictEqual(result.API_KEY, 'secret123');
});

test('handles default values', () => {
    const schema = { PORT: { type: 'number', default: 3000 } };
    const result = validateEnv(schema, {});
    assert.strictEqual(result.PORT, 3000);
});

test('throws on missing required variable', () => {
    const schema = { DATABASE_URL: { type: 'string', required: true } };
    assert.throws(() => {
        validateEnv(schema, {});
    }, /Missing required environment variable: DATABASE_URL/);
});

test('validates boolean types', () => {
    const schema = { DEBUG: { type: 'boolean' } };
    let result = validateEnv(schema, { DEBUG: 'true' });
    assert.strictEqual(result.DEBUG, true);

    result = validateEnv(schema, { DEBUG: '0' });
    assert.strictEqual(result.DEBUG, false);
});

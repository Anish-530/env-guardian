import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { validateEnv } from '../src/validator.js';
import { checkSecurity, isSensitiveKey, isWeakSecret, looksLikeSecret, isValidKey } from '../src/security.js';
import { parseEnvFile } from '../src/parser.js';
import { parseType, generateTypeScriptTypes } from '../src/types.js';

// ═══════════════════════════════════════════════════════════════════
// VALIDATOR TESTS
// ═══════════════════════════════════════════════════════════════════

test('Validator — detects missing required variables', () => {
    const schema = { PORT: { required: true } };
    assert.throws(() => validateEnv(schema, {}), /Missing required environment variable/);
});

test('Validator — applies default values', () => {
    const schema = { HOST: { default: 'localhost' } };
    const validated = validateEnv(schema, {});
    assert.strictEqual(validated.HOST, 'localhost');
});

test('Validator — skips optional missing variables without default', () => {
    const schema = { OPTIONAL_VAR: { type: 'string' } };
    const validated = validateEnv(schema, {});
    assert.strictEqual(validated.OPTIONAL_VAR, undefined);
});

test('Validator — rejects invalid number type', () => {
    const schema = { PORT: { type: 'number' } };
    assert.throws(() => validateEnv(schema, { PORT: 'not_a_number' }), /Must be a valid number/);
});

test('Validator — parses valid number type', () => {
    const schema = { PORT: { type: 'number' } };
    const validated = validateEnv(schema, { PORT: '3000' });
    assert.strictEqual(validated.PORT, 3000);
    assert.strictEqual(typeof validated.PORT, 'number');
});

test('Validator — enforces allowed values', () => {
    const schema = { NODE_ENV: { allowedValues: ['development', 'production'] } };
    assert.throws(() => validateEnv(schema, { NODE_ENV: 'testing' }), /Must be one of/);
});

test('Validator — accepts valid allowed values', () => {
    const schema = { NODE_ENV: { allowedValues: ['development', 'production'] } };
    const validated = validateEnv(schema, { NODE_ENV: 'production' });
    assert.strictEqual(validated.NODE_ENV, 'production');
});

test('Validator — treats empty string as missing for required vars', () => {
    const schema = { HOST: { required: true } };
    assert.throws(() => validateEnv(schema, { HOST: '' }), /Missing required environment variable/);
});

// ═══════════════════════════════════════════════════════════════════
// TYPE PARSING TESTS
// ═══════════════════════════════════════════════════════════════════

test('Types — boolean parsing (true variants)', () => {
    for (const val of ['true', 'TRUE', '1', 'yes', 'YES', 'on', 'ON']) {
        assert.strictEqual(parseType(val, 'boolean'), true, `Expected "${val}" to be true`);
    }
});

test('Types — boolean parsing (false variants)', () => {
    for (const val of ['false', 'FALSE', '0', 'no', 'NO', 'off', 'OFF']) {
        assert.strictEqual(parseType(val, 'boolean'), false, `Expected "${val}" to be false`);
    }
});

test('Types — boolean rejects invalid values', () => {
    assert.throws(() => parseType('maybe', 'boolean'), /Must be a boolean/);
});

test('Types — url validates correct URLs', () => {
    assert.strictEqual(parseType('https://example.com', 'url'), 'https://example.com');
    assert.strictEqual(parseType('http://localhost:3000', 'url'), 'http://localhost:3000');
});

test('Types — url rejects invalid URLs', () => {
    assert.throws(() => parseType('not-a-url', 'url'), /Must be a valid URL/);
});

test('Types — port validates correct ports', () => {
    assert.strictEqual(parseType('80', 'port'), 80);
    assert.strictEqual(parseType('3000', 'port'), 3000);
    assert.strictEqual(parseType('65535', 'port'), 65535);
});

test('Types — port rejects out-of-range values', () => {
    assert.throws(() => parseType('0', 'port'), /Must be a valid port/);
    assert.throws(() => parseType('65536', 'port'), /Must be a valid port/);
    assert.throws(() => parseType('-1', 'port'), /Must be a valid port/);
    assert.throws(() => parseType('3.14', 'port'), /Must be a valid port/);
});

test('Types — email validates correct emails', () => {
    assert.strictEqual(parseType('user@example.com', 'email'), 'user@example.com');
});

test('Types — email rejects invalid emails', () => {
    assert.throws(() => parseType('not-an-email', 'email'), /Must be a valid email/);
    assert.throws(() => parseType('user@', 'email'), /Must be a valid email/);
    assert.throws(() => parseType('@example.com', 'email'), /Must be a valid email/);
});

test('Types — json parses valid JSON', () => {
    const result = parseType('{"key":"value"}', 'json');
    assert.deepStrictEqual(result, { key: 'value' });
});

test('Types — json parses arrays', () => {
    const result = parseType('[1,2,3]', 'json');
    assert.deepStrictEqual(result, [1, 2, 3]);
});

test('Types — json rejects invalid JSON', () => {
    assert.throws(() => parseType('{invalid}', 'json'), /Must be a valid JSON/);
});

test('Types — rejects unknown types', () => {
    assert.throws(() => parseType('value', 'foobar'), /Unknown type/);
});

test('Types — returns null/undefined as-is', () => {
    assert.strictEqual(parseType(null, 'string'), null);
    assert.strictEqual(parseType(undefined, 'number'), undefined);
});

// ═══════════════════════════════════════════════════════════════════
// SECURITY TESTS
// ═══════════════════════════════════════════════════════════════════

test('Security — detects prototype pollution keys', () => {
    assert.throws(() => checkSecurity({ '__PROTO__': 'malicious' }), /Potentially dangerous environment variable/);
});

test('Security — detects constructor pollution', () => {
    assert.throws(() => checkSecurity({ 'CONSTRUCTOR': 'malicious' }), /Potentially dangerous environment variable/);
});

test('Security — masks sensitive error messages', () => {
    const schema = { DB_PASSWORD: { type: 'number' } }; 
    assert.throws(() => validateEnv(schema, { DB_PASSWORD: 'my_secret_password' }), /value masked for security/);
});

test('Security — masks TOKEN in error messages', () => {
    const schema = { AUTH_TOKEN: { type: 'number' } };
    assert.throws(() => validateEnv(schema, { AUTH_TOKEN: 'abc' }), /value masked for security/);
});

test('Security — masks SECRET_KEY in error messages', () => {
    const schema = { SECRET_KEY: { type: 'number' } };
    assert.throws(() => validateEnv(schema, { SECRET_KEY: 'abc' }), /value masked for security/);
});

test('Security — isSensitiveKey detects sensitive patterns', () => {
    assert.strictEqual(isSensitiveKey('DB_PASSWORD'), true);
    assert.strictEqual(isSensitiveKey('API_KEY'), true);
    assert.strictEqual(isSensitiveKey('JWT_SECRET'), true);
    assert.strictEqual(isSensitiveKey('AUTH_TOKEN'), true);
    assert.strictEqual(isSensitiveKey('AWS_SECRET_KEY'), true);
    assert.strictEqual(isSensitiveKey('CREDENTIALS'), true);
    assert.strictEqual(isSensitiveKey('PORT'), false);
    assert.strictEqual(isSensitiveKey('NODE_ENV'), false);
});

test('Security — isWeakSecret detects short secrets', () => {
    assert.strictEqual(isWeakSecret('123'), true);
    assert.strictEqual(isWeakSecret('short'), true);
    assert.strictEqual(isWeakSecret('a-strong-secret-key-here'), false);
});

test('Security — looksLikeSecret detects Stripe keys', () => {
    assert.strictEqual(looksLikeSecret('sk_live_abc123def456'), true);
    assert.strictEqual(looksLikeSecret('pk_test_abc123def456'), true);
});

test('Security — looksLikeSecret detects GitHub tokens', () => {
    assert.strictEqual(looksLikeSecret('ghp_xxxxxxxxxxxxxxxxxxxx'), true);
    assert.strictEqual(looksLikeSecret('gho_xxxxxxxxxxxxxxxxxxxx'), true);
});

test('Security — looksLikeSecret detects PEM keys', () => {
    assert.strictEqual(looksLikeSecret('-----BEGIN RSA PRIVATE KEY-----'), true);
});

test('Security — looksLikeSecret detects long random strings', () => {
    assert.strictEqual(looksLikeSecret('abcdefghijklmnopqrstu'), true);
    assert.strictEqual(looksLikeSecret('short'), false);
});

test('Security — isValidKey rejects dangerous keys', () => {
    assert.strictEqual(isValidKey('__proto__'), false);
    assert.strictEqual(isValidKey('constructor'), false);
    assert.strictEqual(isValidKey('prototype'), false);
});

test('Security — isValidKey rejects keys with special chars', () => {
    assert.strictEqual(isValidKey('KEY WITH SPACES'), false);
    assert.strictEqual(isValidKey('KEY\tTAB'), false);
    assert.strictEqual(isValidKey('KEY\0NULL'), false);
});

test('Security — isValidKey accepts valid keys', () => {
    assert.strictEqual(isValidKey('PORT'), true);
    assert.strictEqual(isValidKey('DB_URL'), true);
    assert.strictEqual(isValidKey('NODE_ENV'), true);
    assert.strictEqual(isValidKey('MY_VAR_123'), true);
});

// ═══════════════════════════════════════════════════════════════════
// PARSER TESTS
// ═══════════════════════════════════════════════════════════════════

test('Parser — returns empty object when file does not exist', () => {
    const result = parseEnvFile('nonexistent.env');
    assert.deepStrictEqual(result, {});
});

test('Parser — rejects oversized values', () => {
    const tempFile = path.resolve(process.cwd(), 'tests', '.env.oversized');
    const largeString = 'a'.repeat((10 * 1024) + 1);
    fs.writeFileSync(tempFile, `LARGE_KEY=${largeString}`);
    
    try {
        assert.throws(() => parseEnvFile('tests/.env.oversized'), /exceeds maximum allowed size of/);
    } finally {
        fs.unlinkSync(tempFile);
    }
});

test('Parser — strips double quotes from values', () => {
    const tempFile = path.resolve(process.cwd(), 'tests', '.env.quotes');
    fs.writeFileSync(tempFile, 'QUOTED="hello world"');
    
    try {
        const result = parseEnvFile('tests/.env.quotes');
        assert.strictEqual(result.QUOTED, 'hello world');
    } finally {
        fs.unlinkSync(tempFile);
    }
});

test('Parser — strips single quotes from values', () => {
    const tempFile = path.resolve(process.cwd(), 'tests', '.env.squotes');
    fs.writeFileSync(tempFile, "QUOTED='hello world'");
    
    try {
        const result = parseEnvFile('tests/.env.squotes');
        assert.strictEqual(result.QUOTED, 'hello world');
    } finally {
        fs.unlinkSync(tempFile);
    }
});

test('Parser — skips comments and blank lines', () => {
    const tempFile = path.resolve(process.cwd(), 'tests', '.env.comments');
    fs.writeFileSync(tempFile, '# This is a comment\n\nKEY=value\n# Another comment');
    
    try {
        const result = parseEnvFile('tests/.env.comments');
        assert.strictEqual(Object.keys(result).length, 1);
        assert.strictEqual(result.KEY, 'value');
    } finally {
        fs.unlinkSync(tempFile);
    }
});

test('Parser — rejects dangerous keys during parse', () => {
    const tempFile = path.resolve(process.cwd(), 'tests', '.env.dangerous');
    fs.writeFileSync(tempFile, '__proto__=malicious');
    
    try {
        assert.throws(() => parseEnvFile('tests/.env.dangerous'), /Invalid or dangerous key/);
    } finally {
        fs.unlinkSync(tempFile);
    }
});

// ═══════════════════════════════════════════════════════════════════
// TYPESCRIPT GENERATION TESTS
// ═══════════════════════════════════════════════════════════════════

test('TypeScript — generates correct types for all validators', () => {
    const schema = {
        PORT: { type: 'port', required: true },
        DB_URL: { type: 'url', required: true },
        ADMIN_EMAIL: { type: 'email' },
        CONFIG: { type: 'json' },
        DEBUG: { type: 'boolean', required: true },
        COUNT: { type: 'number' },
        NAME: { type: 'string', required: true },
    };

    const output = generateTypeScriptTypes(schema);

    assert.ok(output.includes('PORT: number;'), 'port should map to number');
    assert.ok(output.includes('DB_URL: string;'), 'url should map to string');
    assert.ok(output.includes('ADMIN_EMAIL?: string;'), 'optional email should map to string?');
    assert.ok(output.includes('CONFIG?: unknown;'), 'optional json should map to unknown?');
    assert.ok(output.includes('DEBUG: boolean;'), 'required boolean should map to boolean');
    assert.ok(output.includes('COUNT?: number;'), 'optional number should map to number?');
    assert.ok(output.includes('NAME: string;'), 'required string should map to string');
});

test('TypeScript — generates valid declaration format', () => {
    const schema = { PORT: { type: 'number', required: true } };
    const output = generateTypeScriptTypes(schema);

    assert.ok(output.startsWith('declare const env: {'));
    assert.ok(output.includes('export default env;'));
});

// ═══════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════

test('Integration — full validation with multiple types', () => {
    const schema = {
        PORT: { type: 'number', required: true, default: 3000 },
        NODE_ENV: { type: 'string', allowedValues: ['development', 'production'], default: 'development' },
        DEBUG: { type: 'boolean', default: false },
    };

    const env = validateEnv(schema, { PORT: '8080', NODE_ENV: 'production', DEBUG: 'yes' });
    
    assert.strictEqual(env.PORT, 8080);
    assert.strictEqual(env.NODE_ENV, 'production');
    assert.strictEqual(env.DEBUG, true);
});

test('Integration — defaults are applied for missing variables', () => {
    const schema = {
        PORT: { type: 'number', default: 3000 },
        HOST: { type: 'string', default: 'localhost' },
    };

    const env = validateEnv(schema, {});
    
    assert.strictEqual(env.PORT, 3000);
    assert.strictEqual(env.HOST, 'localhost');
});

test('Integration — multiple errors are collected', () => {
    const schema = {
        PORT: { type: 'number', required: true },
        DB_URL: { type: 'url', required: true },
        NODE_ENV: { type: 'string', required: true },
    };

    try {
        validateEnv(schema, {});
        assert.fail('Should have thrown');
    } catch (err) {
        assert.ok(err.message.includes('PORT'));
        assert.ok(err.message.includes('DB_URL'));
        assert.ok(err.message.includes('NODE_ENV'));
    }
});

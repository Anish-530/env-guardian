import fs from 'node:fs';
import path from 'node:path';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

const isValidKey = (key) => {
    if (DANGEROUS_KEYS.includes(key.toLowerCase())) return false;
    return /^[a-zA-Z0-9_]+$/.test(key);
};

export const parseEnvFile = (filePath) => {
    const fullPath = path.resolve(process.cwd(), filePath);

    let stats;
    try {
        stats = fs.statSync(fullPath);
    } catch (err) {
        if (err.code === 'ENOENT') return {};
        throw err;
    }

    if (stats.size > MAX_FILE_SIZE) {
        throw new Error('Environment file exceeds maximum allowed size of 1MB');
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const result = Object.create(null);

    const lines = content.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (!match) continue;

        const key = match[1].trim();
        let value = match[2].trim();

        if (!isValidKey(key)) {
            throw new Error(`Invalid or dangerous key detected: ${key}`);
        }

        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        result[key] = value;
    }

    return result;
};
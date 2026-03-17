import fs from 'node:fs';
import path from 'node:path';
import chalk from "chalk";
import { isValidKey, sanitizeValue } from './security.js';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_VALUE_SIZE = 10 * 1024; // 10KB

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
        throw new Error(chalk.red(`Environment file exceeds maximum allowed size of ${chalk.bold('1MB')}`));
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
        let value = match[2];

        if (!isValidKey(key)) {
            throw new Error(chalk.red(`Invalid or dangerous key detected during parse: ${chalk.bold(key)}`));
        }

        if (Buffer.byteLength(value, 'utf-8') > MAX_VALUE_SIZE) {
            throw new Error(chalk.red(`Value for key ${chalk.bold(key)} exceeds maximum allowed size of ${chalk.bold('10KB')}`));
        }

        value = value.trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        result[key] = sanitizeValue(value);
    }

    return result;
};
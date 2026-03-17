import chalk from "chalk";
import { EnvSecurityError } from "./errors.js";

const SENSITIVE_KEYWORDS = ['SECRET', 'TOKEN', 'PASSWORD', 'API_KEY', 'PRIVATE_KEY'];

export const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

const INVALID_KEY_PATTERN = /[\s\x00-\x1F\x7F]/;

export const isValidKey = (key) => {
    if (typeof key !== 'string') return false;
    if (DANGEROUS_KEYS.includes(key.toLowerCase())) return false;
    if (INVALID_KEY_PATTERN.test(key)) return false;

    return /^[a-zA-Z0-9_]+$/.test(key);
};

export const sanitizeValue = (value) => {
    if (typeof value !== 'string') return '';

    return value.trim().replace(/\0/g, '');
};

export const isSensitiveKey = (key) => {
    if (typeof key !== 'string') return false;
    const upperKey = key.toUpperCase();
    return SENSITIVE_KEYWORDS.some(keyword => upperKey.includes(keyword));
};

export const isWeakSecret = (value) => {
    if (typeof value !== 'string') return false;
    return value.length < 8;
};

export const looksLikeSecret = (value) => {
    if (typeof value !== 'string') return false;

    if (value.startsWith('sk-') || value.startsWith('pk-')) return true;
    if (value.includes('-----BEGIN')) return true;

    const isLongRandomString = value.length >= 20 && !/\s/.test(value);
    if (isLongRandomString) return true;

    return false;
};

export const checkSecurity = (env) => {
    for (const key of DANGEROUS_KEYS) {
        if (Object.hasOwn(env, key.toUpperCase()) || Object.hasOwn(env, key.toLowerCase())) {
            throw new EnvSecurityError(chalk.red(`Potentially dangerous environment variable detected: ${chalk.bold(key)}`));
        }
    }

    for (const key of Object.keys(env)) {
        if (!isValidKey(key)) {
            if (INVALID_KEY_PATTERN.test(key) || DANGEROUS_KEYS.includes(key.toLowerCase())) {
                throw new EnvSecurityError(chalk.red(`Invalid or dangerous key format detected in runtime environment: ${chalk.bold(key)}`));
            }
        }
    }
};

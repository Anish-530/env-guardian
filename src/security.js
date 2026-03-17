import { EnvSecurityError } from "./errors.js";

const SENSITIVE_KEYWORDS = ['SECRET', 'TOKEN', 'PASSWORD', 'API_KEY', 'PRIVATE_KEY'];

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

    return false;
};

export const checkSecurity = (env) => {
    const dangerousKeys = [
        '__PROTO__',
        'CONSTRUCTOR',
        'PROTOTYPE'
    ];

    for (const key of dangerousKeys) {
        if (Object.hasOwn(env, key.toUpperCase()) || Object.hasOwn(env, key.toLowerCase())) {
            throw new EnvSecurityError(`Potentially dangerous environment variable detected: ${key}`)
        }
    }
};
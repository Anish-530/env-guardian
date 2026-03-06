import { EnvSecurityError } from "./errors.js";

export const checkSecurity = (env) => {
    const dangerousKeys = [
        '__PROTO__',
        'CONSTRUCTOR',
        'PROTOTYPE'
    ];

    for (const key of dangerousKeys) {
        if (key.toUpperCase() in env || key.toLowerCase() in env) {
            throw new EnvSecurityError(`Potentially dangerous environment variable detected: ${key}`)
        }
    }
};
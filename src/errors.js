import { SENSITIVE_KEYWORDS } from './security.js';

export class EnvValidationError extends Error {
    constructor(message, property) {
        let safeMessage = message;

        if (property && SENSITIVE_KEYWORDS.some(kw => property.toUpperCase().includes(kw))) {
            safeMessage = `Invalid value for ${property} (value masked for security)`;
        }

        super(safeMessage);
        this.name = 'EnvValidationError';
        this.property = property;
    }
}

export class EnvSecurityError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EnvSecurityError';
    }
}
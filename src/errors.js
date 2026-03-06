export class EnvValidationError extends Error {
    constructor(message, property) {
        super(message);
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
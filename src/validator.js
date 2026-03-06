import { EnvValidationError } from "./errors.js";
import { parseType } from "./types.js";

export const validateEnv = (schema, sourceEnv = process.env) => {
    const validated = {};
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
        let rawValue = sourceEnv[key];

        if (rawValue === undefined && rules.default !== undefined) {
            rawValue = rules.default;
        }

        if (rules.required && (rawValue === undefined || rawValue === '')) {
            errors.push(new EnvValidationError(`Missing required environment variable: ${key}`, key));
            continue;
        }

        if (rawValue === undefined) {
            continue;
        }

        try {
            let parsedValue = rawValue;
            if (rules.type) {
                parsedValue = parseType(rawValue, rules.type);
            }

            if (rules.allowedValues && !rules.allowedValues.includes(parsedValue)) {
                throw new Error(`Must be one of: ${rules.allowedValues.join(', ')}`);                
            }
            validated[key] = parsedValue;
        } catch (err) {
            errors.push(new EnvValidationError(`Invalid value for ${key}: ${err.message}`, key));
        }
    }

    if (errors.length > 0) {
        const errorMessage = errors.map(e => `-${e.message}`).join('\n');
        throw new EnvValidationError(`Environment validation failed:\n${errorMessage}`);
    }
    
    return validated;
};
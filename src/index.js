import { parseEnvFile } from "./parser.js";
import { validateEnv } from "./validator.js";
import { checkSecurity } from "./security.js";

export const loadAndValidate = (schema, options = {}) => {
    const parsed = options.skipDotenv ? {} : parseEnvFile(options.path || '.env');
    const combinedEnv = { ...process.env, ...parsed};
    
    checkSecurity(combinedEnv);

    return validateEnv(schema, combinedEnv);
};

export { validateEnv } from './validator.js';
export { parseEnvFile as parseDotenv } from './parser.js';
export { EnvValidationError, EnvSecurityError } from './errors.js';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { parseEnvFile } from "./parser.js";
import { validateEnv } from "./validator.js";
import { checkSecurity } from "./security.js";
import { generateTypeScriptTypes } from './types.js';

export const version = '2.0.0';

export const loadAndValidate = (schema, options = {}) => {
    const parsed = options.skipDotenv ? {} : parseEnvFile(options.path || '.env');
    const combinedEnv = { ...parsed, ...process.env };

    checkSecurity(combinedEnv);

    return validateEnv(schema, combinedEnv);
};

export const createEnvTypes = (schema, outputDir = process.cwd()) => {
    try {
        const tsContent = generateTypeScriptTypes(schema);
        const outputPath = path.resolve(outputDir, 'env.d.ts');
        fs.writeFileSync(outputPath, tsContent, 'utf-8');
        console.log(chalk.bold.green(`✅ Success: TypeScript definitions generated at ${chalk.cyan(outputPath)}`));
    } catch (err) {
        console.error(chalk.bold.red('❌ Error: Failed to generate TypeScript definitions.'));
        console.error(`  ${chalk.red('•')} ${err.message}`);
    }
};

export { validateEnv } from './validator.js';
export { parseEnvFile as parseDotenv } from './parser.js';
export { EnvValidationError, EnvSecurityError } from './errors.js';
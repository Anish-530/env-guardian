#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { loadAndValidate, createEnvTypes, version } from '../src/index.js';

// ─── Argument Parsing ───────────────────────────────────────────────

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(`--${flag}`) || args.includes(`-${flag[0]}`);

// ─── Warning Capture ────────────────────────────────────────────────

const warnings = [];
const originalWarn = console.warn;
console.warn = (message) => {
    warnings.push(message);
};

// ─── UI Helpers ─────────────────────────────────────────────────────

const printHeader = () => {
    console.log(chalk.bold.cyan(`\n🔒 SEALENV v${version}`));
    console.log(chalk.gray('=======================\n'));
};

const printErrors = (errorMessage) => {
    console.log(chalk.bold.red('Errors:'));
    
    const errorLines = errorMessage.split('\n');
    for (const line of errorLines) {
        if (line.startsWith('-')) {
            const cleanLine = line.substring(1).trim();
            
            if (cleanLine.startsWith('Missing required environment variable:')) {
                const key = cleanLine.replace('Missing required environment variable:', '').trim();
                console.log(`  ${chalk.red('•')} ${chalk.bold(key)} ${chalk.gray('→')} expected value`);
            } else if (cleanLine.startsWith('Invalid value for')) {
                const match = cleanLine.match(/Invalid value for\s([A-Za-z0-9_]+):\s(.*)/);
                if (match) {
                    console.log(`  ${chalk.red('•')} ${chalk.bold(match[1])} ${chalk.gray('→')} ${match[2]}`);
                } else {
                    console.log(`  ${chalk.red('•')} ${cleanLine}`);
                }
            } else {
                 console.log(`  ${chalk.red('•')} ${cleanLine}`);
            }
        } else if (!line.startsWith('Environment validation failed:')) {
            if (line.trim()) console.log(`  ${chalk.red('•')} ${line.trim()}`);
        }
    }
    console.log('');
};

const printWarnings = () => {
    if (warnings.length === 0) return;
    
    console.log(chalk.bold.yellow('⚠️  Warnings:'));
    for (const warning of warnings) {
        const cleanMessage = warning.replace('⚠️ ', '').trim();
        
        if (cleanMessage.startsWith('Weak secret detected for')) {
            const key = cleanMessage.replace('Weak secret detected for', '').trim();
            console.log(`  ${chalk.yellow('•')} ${chalk.bold(key)} ${chalk.gray('→')} weak secret`);
        } else if (cleanMessage.includes('looks like a real secret')) {
             const key = cleanMessage.split(' ')[0];
             console.log(`  ${chalk.yellow('•')} ${chalk.bold(key)} ${chalk.gray('→')} possible secret`);
        } else {
             console.log(`  ${chalk.yellow('•')} ${cleanMessage}`);
        }
    }
    console.log('');
};

const printHelp = () => {
    console.log(chalk.bold.cyan(`\n🔒 SEALENV v${version}`));
    console.log(chalk.gray('=======================\n'));
    console.log(chalk.bold('Usage:'));
    console.log(`  ${chalk.cyan('npx sealenv')}             Validate .env against env-schema.json`);
    console.log(`  ${chalk.cyan('npx sealenv --init')}      Generate env-schema.json from your .env file`);
    console.log(`  ${chalk.cyan('npx sealenv --types')}     Generate env.d.ts from env-schema.json`);
    console.log(`  ${chalk.cyan('npx sealenv --help')}      Show this help message`);
    console.log('');
    console.log(chalk.bold('Options:'));
    console.log(`  ${chalk.yellow('--init, -i')}     Scan your .env file and generate an env-schema.json`);
    console.log(`  ${chalk.yellow('--types, -t')}    Generate TypeScript definitions from your schema`);
    console.log(`  ${chalk.yellow('--help, -h')}     Show this help message`);
    console.log('');
};

// ─── Commands ───────────────────────────────────────────────────────

const inferType = (value) => {
    if (['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'].includes(value.toLowerCase())) {
        return 'boolean';
    }
    if (!Number.isNaN(Number(value)) && value.trim() !== '') {
        return 'number';
    }
    try {
        new URL(value);
        if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
    } catch { /* not a url */ }
    try {
        JSON.parse(value);
        if (value.startsWith('{') || value.startsWith('[')) return 'json';
    } catch { /* not json */ }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'email';
    }
    return 'string';
};

const runInit = () => {
    printHeader();

    const envPath = path.resolve(process.cwd(), '.env');

    if (!fs.existsSync(envPath)) {
        console.log(chalk.bold.red('Errors:'));
        console.log(`  ${chalk.red('•')} ${chalk.bold('.env')} ${chalk.gray('→')} not found in current directory\n`);
        console.log(chalk.gray('  Create a .env file first, then run this command again.\n'));
        process.exit(1);
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const schema = {};
    let count = 0;

    const lines = content.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (!match) continue;

        const key = match[1].trim();
        let value = match[2].trim();

        // Strip quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        schema[key] = {
            type: inferType(value),
            required: true,
        };
        count++;
    }

    const schemaPath = path.resolve(process.cwd(), 'env-schema.json');
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n', 'utf-8');

    console.log(chalk.bold.green(`✅ Generated env-schema.json with ${chalk.cyan(count)} variables.\n`));
    console.log(chalk.gray('  Review the schema and adjust types/required fields as needed.'));
    console.log(chalk.gray(`  Then run ${chalk.cyan('npx sealenv')} to validate.\n`));
};

const runTypes = () => {
    printHeader();

    const schemaPath = path.resolve(process.cwd(), 'env-schema.json');

    if (!fs.existsSync(schemaPath)) {
        console.log(chalk.bold.red('Errors:'));
        console.log(`  ${chalk.red('•')} ${chalk.bold('env-schema.json')} ${chalk.gray('→')} not found in current directory\n`);
        console.log(chalk.gray(`  Run ${chalk.cyan('npx sealenv --init')} first to generate one.\n`));
        process.exit(1);
    }

    try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        createEnvTypes(schema);
    } catch (err) {
        console.log(chalk.bold.red('❌ Unexpected Error:'));
        console.log(`  ${chalk.red('•')} ${err.message}\n`);
        process.exit(1);
    }
};

const runValidate = () => {
    printHeader();

    const schemaPath = path.resolve(process.cwd(), 'env-schema.json');

    if (!fs.existsSync(schemaPath)) {
        console.log(chalk.bold.red('Errors:'));
        console.log(`  ${chalk.red('•')} ${chalk.bold('env-schema.json')} ${chalk.gray('→')} not found in current directory\n`);
        console.log(chalk.gray(`  Run ${chalk.cyan('npx sealenv --init')} to generate one from your .env file.\n`));
        process.exit(1);
    }

    try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        
        const validated = loadAndValidate(schema);
        const varCount = Object.keys(validated).length;
        
        printWarnings();
        
        console.log(chalk.bold.green(`✅ Success: Environment is valid and secure.`));
        console.log(chalk.gray(`   ${varCount} variable${varCount !== 1 ? 's' : ''} checked, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}.\n`));
        
    } catch (err) {
        if (err.name === 'EnvValidationError') {
            printErrors(err.message);
            printWarnings();
        } else if (err.name === 'EnvSecurityError') {
             console.log(chalk.bold.red('Errors:'));
             console.log(`  ${chalk.red('•')} ${chalk.bold('SECURITY')} ${chalk.gray('→')} ${err.message}\n`);
        } else {
            console.log(chalk.bold.red('❌ Unexpected Error:'));
            console.log(`  ${chalk.red('•')} ${err.message}\n`);
        }
        process.exit(1);
    }
};

// ─── Main ───────────────────────────────────────────────────────────

if (hasFlag('help') || hasFlag('h')) {
    printHelp();
} else if (hasFlag('init') || hasFlag('i')) {
    runInit();
} else if (hasFlag('types') || hasFlag('t')) {
    runTypes();
} else {
    runValidate();
}

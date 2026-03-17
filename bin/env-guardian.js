#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { loadAndValidate } from '../src/index.js';

const VERSION = '1.1';

// Overwrite console.warn to capture warnings instead of printing immediately
const warnings = [];
const originalWarn = console.warn;
console.warn = (message) => {
    warnings.push(message);
};

const printHeader = () => {
    console.log(chalk.bold.cyan(`\n🛡️  ENV GUARDIAN v${VERSION}`));
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

const runCLI = () => {
    printHeader();

    const schemaPath = path.resolve(process.cwd(), 'env-schema.json');

    if (!fs.existsSync(schemaPath)) {
        console.log(chalk.bold.red('Errors:'));
        console.log(`  ${chalk.red('•')} ${chalk.bold('env-schema.json')} ${chalk.gray('→')} not found in current directory\n`);
        process.exit(1);
    }

    try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        
        loadAndValidate(schema);
        
        printWarnings();
        
        console.log(chalk.bold.green('✅ Success: Environment configuration is valid and secure.\n'));
        
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

runCLI();

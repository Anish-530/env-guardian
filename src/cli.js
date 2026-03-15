#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadAndValidate } from './index.js'

const schemaPath = path.resolve(process.cwd(), 'env-schema.json');

if(!fs.existsSync(schemaPath)) {
    console.error('Error: env-schema.json not found in current directory.')
    process.exit(1);
}

try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    loadAndValidate(schema);
    console.log('✅ Environment configuration is valid and secure.');
} catch (err) {
    console.error(`❌ Validation Failed:\n${err.message}`)
    process.exit(1)
}
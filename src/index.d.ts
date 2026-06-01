// Type definitions for envlock 2.0.0

/**
 * Supported environment variable types.
 */
export type EnvType = 'string' | 'number' | 'boolean' | 'url' | 'port' | 'email' | 'json';

/**
 * Schema rule for a single environment variable.
 */
export interface EnvSchemaRule {
    /** The expected type of the variable. Defaults to 'string'. */
    type?: EnvType;
    /** Whether this variable must be present. */
    required?: boolean;
    /** Default value if the variable is not set. */
    default?: string | number | boolean;
    /** Restrict the value to one of these allowed values. */
    allowedValues?: (string | number | boolean)[];
}

/**
 * A schema object mapping environment variable names to their rules.
 */
export interface EnvSchema {
    [key: string]: EnvSchemaRule;
}

/**
 * Options for the loadAndValidate function.
 */
export interface EnvLoadOptions {
    /** Path to the .env file. Defaults to '.env'. */
    path?: string;
    /** If true, skips reading the .env file and only validates process.env. */
    skipDotenv?: boolean;
}

/**
 * Loads environment variables from a .env file, merges with process.env,
 * runs security checks, and validates against the provided schema.
 *
 * @param schema - The validation schema.
 * @param options - Optional configuration.
 * @returns A validated object containing only the variables defined in the schema.
 * @throws {EnvValidationError} If validation fails.
 * @throws {EnvSecurityError} If a security threat is detected.
 */
export function loadAndValidate<T extends EnvSchema>(
    schema: T,
    options?: EnvLoadOptions
): { [K in keyof T]: T[K]['type'] extends 'number' | 'port' ? number : T[K]['type'] extends 'boolean' ? boolean : T[K]['type'] extends 'json' ? unknown : string };

/**
 * Generates a TypeScript definition file (env.d.ts) from a schema.
 *
 * @param schema - The validation schema.
 * @param outputDir - Directory to write the env.d.ts file. Defaults to process.cwd().
 */
export function createEnvTypes(schema: EnvSchema, outputDir?: string): void;

/**
 * Validates environment variables against a schema without loading from a file.
 *
 * @param schema - The validation schema.
 * @param sourceEnv - The environment object to validate. Defaults to process.env.
 * @returns A validated object.
 * @throws {EnvValidationError} If validation fails.
 */
export function validateEnv<T extends EnvSchema>(
    schema: T,
    sourceEnv?: Record<string, string | undefined>
): { [K in keyof T]: T[K]['type'] extends 'number' | 'port' ? number : T[K]['type'] extends 'boolean' ? boolean : T[K]['type'] extends 'json' ? unknown : string };

/**
 * Parses a .env file and returns a plain object of key-value pairs.
 *
 * @param filePath - Path to the .env file.
 * @returns Parsed key-value pairs.
 */
export function parseDotenv(filePath: string): Record<string, string>;

/**
 * Error thrown when environment variable validation fails.
 * Automatically masks sensitive values in error messages.
 */
export class EnvValidationError extends Error {
    name: 'EnvValidationError';
    property?: string;
    constructor(message: string, property?: string);
}

/**
 * Error thrown when a security threat is detected in environment variables.
 */
export class EnvSecurityError extends Error {
    name: 'EnvSecurityError';
    constructor(message: string);
}

/** The current version of envlock. */
export const version: string;

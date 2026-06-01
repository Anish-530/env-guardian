export const parseType = (value, type) => {
    if (value === undefined || value === null) {
        return value;
    }

    if (type === 'string') {
        return String(value);
    }

    if (type === 'number') {
        const num = Number(value);
        if (Number.isNaN(num)) {
            throw new Error('Must be a valid number.');
        }
        return num;
    }

    if (type === 'boolean') {
        const normalized = String(value).trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
        throw new Error('Must be a boolean (true/false) | (1/0) | (yes/no)');
    }

    if (type === 'url') {
        const str = String(value).trim();
        try {
            new URL(str);
        } catch {
            throw new Error('Must be a valid URL (e.g. https://example.com).');
        }
        return str;
    }

    if (type === 'port') {
        const num = Number(value);
        if (Number.isNaN(num) || !Number.isInteger(num) || num < 1 || num > 65535) {
            throw new Error('Must be a valid port number (1-65535).');
        }
        return num;
    }

    if (type === 'email') {
        const str = String(value).trim();
        // Practical email regex: local@domain with at least one dot in domain
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(str)) {
            throw new Error('Must be a valid email address.');
        }
        return str;
    }

    if (type === 'json') {
        const str = String(value);
        try {
            return JSON.parse(str);
        } catch {
            throw new Error('Must be a valid JSON string.');
        }
    }

    throw new Error(`Unknown type: ${type}`);
};

const TS_TYPE_MAP = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    url: 'string',
    port: 'number',
    email: 'string',
    json: 'unknown',
};

export const generateTypeScriptTypes = (schema) => {
    let tsContent = 'declare const env: {\n';

    for (const [key, rules] of Object.entries(schema)) {
        const tsType = TS_TYPE_MAP[rules.type] || 'string';
        const isOptional = rules.required ? '' : '?';

        tsContent += `  ${key}${isOptional}: ${tsType};\n`;
    }

    tsContent += '};\n\nexport default env;\n';

    return tsContent;
};
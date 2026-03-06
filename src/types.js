export const parseType = (value, type) => {
    if (value === undefined || value === null) {
        return value;
    }

    if (type === 'string') {
        return String(value);
    }

    if (type === 'number') {
        const num = Number(value)
        if (Number.isNaN(num)) {
            throw new Error('Must be a valid number.')
        }
        return num;
    }

    if (type === 'boolean') {
        const normalized = String(value).trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
        throw new Error('Must be a boolean (true/false) | (1/0) | (yes/no)')
    }

    throw new Error(`Unknown type: ${type}`)
};
import { registerMatcher } from '../../expect.js';
registerMatcher('safeInteger', safeInteger);
export function safeInteger() {
    return (value) => {
        if (typeof value === 'number' && !Number.isInteger(value)) {
            return false;
        }
        if (typeof value === 'number' || typeof value === 'bigint') {
            return (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER);
        }
        return false;
    };
}
//# sourceMappingURL=safeInteger.js.map
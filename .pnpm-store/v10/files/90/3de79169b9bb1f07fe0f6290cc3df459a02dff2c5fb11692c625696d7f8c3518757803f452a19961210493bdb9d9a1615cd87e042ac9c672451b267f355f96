import { registerMatcher } from '../../expect.js';
registerMatcher('notEmpty', notEmpty);
export function notEmpty() {
    return (value) => {
        if (typeof value === 'string')
            return value.length > 0;
        if (Array.isArray(value))
            return value.length > 0;
        if (value instanceof Set)
            return value.size > 0;
        if (value instanceof Map)
            return value.size > 0;
        return false;
    };
}
//# sourceMappingURL=notEmpty.js.map
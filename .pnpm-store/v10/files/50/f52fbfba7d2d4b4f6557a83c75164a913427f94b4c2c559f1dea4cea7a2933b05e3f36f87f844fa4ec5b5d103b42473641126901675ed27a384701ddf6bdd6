import { registerMatcher } from '../../expect.js';
import { isEqual } from '../../isEqual/index.js';
registerMatcher('subset', subset);
export function subset(subset) {
    if (!isObject(subset)) {
        return () => false;
    }
    return (value) => {
        if (!isObject(value)) {
            return false;
        }
        return Object.entries(subset).every(([key, expected]) => isEqual(value[key], expected));
    };
}
function isObject(value) {
    return (value != null && (typeof value === 'object' || typeof value === 'function'));
}
//# sourceMappingURL=subset.js.map
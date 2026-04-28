import { registerMatcher } from '../../expect.js';
import { isEqual } from '../../isEqual/index.js';
registerMatcher('length', length);
export function length(length) {
    return (value) => {
        const canCheck = (value != null && typeof value === 'object' && 'length' in value) ||
            typeof value === 'string';
        return canCheck && isEqual(value.length, length);
    };
}
//# sourceMappingURL=length.js.map
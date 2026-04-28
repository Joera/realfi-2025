import { registerMatcher } from '../../expect.js';
registerMatcher('regex', regex);
export function regex(regex) {
    return (value) => {
        if (typeof value !== 'string') {
            return false;
        }
        return regex.test(value);
    };
}
//# sourceMappingURL=regex.js.map
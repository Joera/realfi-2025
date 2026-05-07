import { registerMatcher } from '../../expect.js';
registerMatcher('closeTo', closeTo);
export function closeTo(target, delta) {
    const min = target - delta;
    const max = target + delta;
    return (value) => typeof value === 'number' && value >= min && value <= max;
}
//# sourceMappingURL=closeTo.js.map
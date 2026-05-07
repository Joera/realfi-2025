import { registerMatcher } from '../../expect.js';
registerMatcher('between', between);
export function between(min, max) {
    const [realMin, realMax] = min < max ? [min, max] : [max, min];
    return (value) => (typeof value === 'number' || typeof value === 'bigint') &&
        value >= realMin &&
        value <= realMax;
}
//# sourceMappingURL=between.js.map
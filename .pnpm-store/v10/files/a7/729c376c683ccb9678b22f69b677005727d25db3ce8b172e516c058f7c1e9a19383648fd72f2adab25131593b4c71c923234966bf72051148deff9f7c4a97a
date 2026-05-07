import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { assertIsMock, formatCalledTimes, formatTimes } from './utils.js';
registerValidator('toHaveBeenCalledTimes', toHaveBeenCalledTimes);
export function toHaveBeenCalledTimes(control, times) {
    assertIsMock(control);
    if (!Number.isInteger(times) || times < 0) {
        const timeInline = formatCompact(times);
        throw new TypeError(`toHaveBeenCalledTimes expects the first argument to be a non-negative integer, but received ${timeInline}.`);
    }
    const expectedTimes = formatTimes(times);
    const calledTimes = formatCalledTimes(control.actual);
    return control.assert({
        success: control.actual.calls.length === times,
        reason: `The mock function was ${calledTimes}, but it was expected to have been called ${expectedTimes}.`,
        negatedReason: `The mock function was ${calledTimes}, but it was expected not to have been called ${expectedTimes}.`,
        actual: control.actual.calls.length,
        expected: times,
    });
}
//# sourceMappingURL=toHaveBeenCalledTimes.js.map
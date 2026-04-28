import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { assertIsMock, compareArgs, formatCalledTimes, formatTimes, } from './utils.js';
registerValidator('toHaveBeenNthCalledWith', toHaveBeenNthCalledWith);
export function toHaveBeenNthCalledWith(control, n, ...expected) {
    assertIsMock(control);
    if (!Number.isInteger(n) || n < 1) {
        const timeInline = formatCompact(n);
        throw new TypeError(`toHaveBeenNthCalledWith expects the first argument to be a positive integer, but received ${timeInline}.`);
    }
    const nthCall = control.actual.calls[n - 1];
    if (nthCall === undefined) {
        const times = formatTimes(n);
        const calledTimes = formatCalledTimes(control.actual);
        return control.assert({
            success: false,
            reason: `The mock function was ${calledTimes}, but it was expected to have been called at least ${times}.`,
            negatedReason: '',
            actual: control.actual.calls.length,
            expected: n,
        });
    }
    compareArgs(control, nthCall.args, expected);
}
//# sourceMappingURL=toHaveBeenNthCalledWith.js.map
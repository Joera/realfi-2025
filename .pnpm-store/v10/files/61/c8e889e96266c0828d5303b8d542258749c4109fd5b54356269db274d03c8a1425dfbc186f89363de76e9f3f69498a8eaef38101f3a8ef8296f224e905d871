import { registerValidator } from '../../expect.js';
import { assertIsMock, compareArgs, formatCalledTimes } from './utils.js';
registerValidator('toHaveBeenOnlyCalledWith', toHaveBeenOnlyCalledWith);
export function toHaveBeenOnlyCalledWith(control, ...expected) {
    assertIsMock(control);
    const onlyCall = control.actual.calls[0];
    if (control.actual.calls.length !== 1 || onlyCall === undefined) {
        const calledTimes = formatCalledTimes(control.actual);
        return control.assert({
            success: false,
            reason: `The mock function was ${calledTimes}, but it was expected to have been called exactly once.`,
            negatedReason: '',
            actual: control.actual.calls.length,
            expected: 1,
        });
    }
    compareArgs(control, onlyCall.args, expected);
}
//# sourceMappingURL=toHaveBeenOnlyCalledWith.js.map
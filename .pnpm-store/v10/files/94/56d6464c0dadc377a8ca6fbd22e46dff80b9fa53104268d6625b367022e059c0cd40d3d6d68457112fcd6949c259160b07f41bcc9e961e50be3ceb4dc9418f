import { registerValidator } from '../../expect.js';
import { assertIsMock, formatCalledTimes } from './utils.js';
registerValidator('toHaveBeenCalled', toHaveBeenCalled);
export function toHaveBeenCalled(control) {
    assertIsMock(control);
    const calledTimes = formatCalledTimes(control.actual);
    return control.assert({
        success: control.actual.calls.length > 0,
        reason: `The mock function was ${calledTimes}, but it was expected to have been called at least once.`,
        negatedReason: `The mock function was ${calledTimes}, but it was expected to never have been called.`,
    });
}
//# sourceMappingURL=toHaveBeenCalled.js.map
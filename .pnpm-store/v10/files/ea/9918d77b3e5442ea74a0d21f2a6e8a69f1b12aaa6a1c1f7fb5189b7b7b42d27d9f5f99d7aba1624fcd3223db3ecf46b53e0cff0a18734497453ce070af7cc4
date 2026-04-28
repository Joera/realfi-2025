"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHaveBeenOnlyCalledWith = void 0;
const expect_js_1 = require("../../expect.js");
const utils_js_1 = require("./utils.js");
(0, expect_js_1.registerValidator)('toHaveBeenOnlyCalledWith', toHaveBeenOnlyCalledWith);
function toHaveBeenOnlyCalledWith(control, ...expected) {
    (0, utils_js_1.assertIsMock)(control);
    const onlyCall = control.actual.calls[0];
    if (control.actual.calls.length !== 1 || onlyCall === undefined) {
        const calledTimes = (0, utils_js_1.formatCalledTimes)(control.actual);
        return control.assert({
            success: false,
            reason: `The mock function was ${calledTimes}, but it was expected to have been called exactly once.`,
            negatedReason: '',
            actual: control.actual.calls.length,
            expected: 1,
        });
    }
    (0, utils_js_1.compareArgs)(control, onlyCall.args, expected);
}
exports.toHaveBeenOnlyCalledWith = toHaveBeenOnlyCalledWith;
//# sourceMappingURL=toHaveBeenOnlyCalledWith.js.map
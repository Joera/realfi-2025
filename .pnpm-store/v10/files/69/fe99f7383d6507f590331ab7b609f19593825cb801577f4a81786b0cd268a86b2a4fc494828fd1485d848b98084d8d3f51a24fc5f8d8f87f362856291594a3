"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHaveBeenNthCalledWith = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const utils_js_1 = require("./utils.js");
(0, expect_js_1.registerValidator)('toHaveBeenNthCalledWith', toHaveBeenNthCalledWith);
function toHaveBeenNthCalledWith(control, n, ...expected) {
    (0, utils_js_1.assertIsMock)(control);
    if (!Number.isInteger(n) || n < 1) {
        const timeInline = (0, index_js_1.formatCompact)(n);
        throw new TypeError(`toHaveBeenNthCalledWith expects the first argument to be a positive integer, but received ${timeInline}.`);
    }
    const nthCall = control.actual.calls[n - 1];
    if (nthCall === undefined) {
        const times = (0, utils_js_1.formatTimes)(n);
        const calledTimes = (0, utils_js_1.formatCalledTimes)(control.actual);
        return control.assert({
            success: false,
            reason: `The mock function was ${calledTimes}, but it was expected to have been called at least ${times}.`,
            negatedReason: '',
            actual: control.actual.calls.length,
            expected: n,
        });
    }
    (0, utils_js_1.compareArgs)(control, nthCall.args, expected);
}
exports.toHaveBeenNthCalledWith = toHaveBeenNthCalledWith;
//# sourceMappingURL=toHaveBeenNthCalledWith.js.map
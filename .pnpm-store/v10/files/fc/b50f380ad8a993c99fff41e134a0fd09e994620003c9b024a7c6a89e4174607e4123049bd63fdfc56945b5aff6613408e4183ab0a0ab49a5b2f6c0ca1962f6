"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHaveBeenCalledTimes = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const utils_js_1 = require("./utils.js");
(0, expect_js_1.registerValidator)('toHaveBeenCalledTimes', toHaveBeenCalledTimes);
function toHaveBeenCalledTimes(control, times) {
    (0, utils_js_1.assertIsMock)(control);
    if (!Number.isInteger(times) || times < 0) {
        const timeInline = (0, index_js_1.formatCompact)(times);
        throw new TypeError(`toHaveBeenCalledTimes expects the first argument to be a non-negative integer, but received ${timeInline}.`);
    }
    const expectedTimes = (0, utils_js_1.formatTimes)(times);
    const calledTimes = (0, utils_js_1.formatCalledTimes)(control.actual);
    return control.assert({
        success: control.actual.calls.length === times,
        reason: `The mock function was ${calledTimes}, but it was expected to have been called ${expectedTimes}.`,
        negatedReason: `The mock function was ${calledTimes}, but it was expected not to have been called ${expectedTimes}.`,
        actual: control.actual.calls.length,
        expected: times,
    });
}
exports.toHaveBeenCalledTimes = toHaveBeenCalledTimes;
//# sourceMappingURL=toHaveBeenCalledTimes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHaveBeenCalled = void 0;
const expect_js_1 = require("../../expect.js");
const utils_js_1 = require("./utils.js");
(0, expect_js_1.registerValidator)('toHaveBeenCalled', toHaveBeenCalled);
function toHaveBeenCalled(control) {
    (0, utils_js_1.assertIsMock)(control);
    const calledTimes = (0, utils_js_1.formatCalledTimes)(control.actual);
    return control.assert({
        success: control.actual.calls.length > 0,
        reason: `The mock function was ${calledTimes}, but it was expected to have been called at least once.`,
        negatedReason: `The mock function was ${calledTimes}, but it was expected to never have been called.`,
    });
}
exports.toHaveBeenCalled = toHaveBeenCalled;
//# sourceMappingURL=toHaveBeenCalled.js.map
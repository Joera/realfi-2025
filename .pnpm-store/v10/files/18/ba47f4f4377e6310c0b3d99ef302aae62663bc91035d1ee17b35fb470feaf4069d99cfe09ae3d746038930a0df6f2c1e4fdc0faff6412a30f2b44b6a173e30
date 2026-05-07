"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeASafeInteger = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const safeInteger_js_1 = require("../../matchers/numbers/safeInteger.js");
(0, expect_js_1.registerValidator)('toBeASafeInteger', toBeASafeInteger);
function toBeASafeInteger(control) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, safeInteger_js_1.safeInteger)()(control.actual),
        reason: `The value ${actualInline} is not a safe integer, but it was expected to be a safe integer.`,
        negatedReason: `The value ${actualInline} is a safe integer, but it was expected not to be a safe integer.`,
    });
}
exports.toBeASafeInteger = toBeASafeInteger;
//# sourceMappingURL=toBeASafeInteger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeAnInteger = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const integer_js_1 = require("../../matchers/numbers/integer.js");
(0, expect_js_1.registerValidator)('toBeAnInteger', toBeAnInteger);
function toBeAnInteger(control) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, integer_js_1.integer)()(control.actual),
        reason: `The value ${actualInline} is not an integer, but it was expected to be an integer.`,
        negatedReason: `The value ${actualInline} is an integer, but it was expected not to be an integer.`,
    });
}
exports.toBeAnInteger = toBeAnInteger;
//# sourceMappingURL=toBeAnInteger.js.map
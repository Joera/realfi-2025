"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeGreaterThan = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const greaterThan_js_1 = require("../../matchers/numbers/greaterThan.js");
(0, expect_js_1.registerValidator)('toBeGreaterThan', toBeGreaterThan);
function toBeGreaterThan(control, target) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const targetInline = (0, index_js_1.formatCompact)(target);
    control.assert({
        success: (0, greaterThan_js_1.greaterThan)(target)(control.actual),
        reason: `The value ${actualInline} is not greater than ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is greater than ${targetInline}, but it was expected not to be.`,
    });
}
exports.toBeGreaterThan = toBeGreaterThan;
//# sourceMappingURL=toBeGreaterThan.js.map
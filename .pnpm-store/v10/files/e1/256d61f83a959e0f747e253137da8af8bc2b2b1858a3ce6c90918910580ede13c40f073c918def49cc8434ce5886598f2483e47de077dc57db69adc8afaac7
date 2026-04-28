"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeCloseTo = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const closeTo_js_1 = require("../../matchers/numbers/closeTo.js");
(0, expect_js_1.registerValidator)('toBeCloseTo', toBeCloseTo);
function toBeCloseTo(control, target, delta) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const targetInline = (0, index_js_1.formatCompact)(target);
    const deltaInline = (0, index_js_1.formatCompact)(delta);
    control.assert({
        success: (0, closeTo_js_1.closeTo)(target, delta)(control.actual),
        reason: `The value ${actualInline} is not close to ${targetInline} +/- ${deltaInline}, but it was expected to be close.`,
        negatedReason: `The value ${actualInline} is close to ${targetInline} +/- ${deltaInline}, but it was expected not to be close.`,
    });
}
exports.toBeCloseTo = toBeCloseTo;
//# sourceMappingURL=toBeCloseTo.js.map
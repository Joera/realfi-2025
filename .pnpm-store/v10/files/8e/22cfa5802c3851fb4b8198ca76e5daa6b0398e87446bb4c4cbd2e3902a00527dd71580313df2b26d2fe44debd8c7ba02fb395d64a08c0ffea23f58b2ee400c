"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeLessThan = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const lessThan_js_1 = require("../../matchers/numbers/lessThan.js");
(0, expect_js_1.registerValidator)('toBeLessThan', toBeLessThan);
function toBeLessThan(control, target) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const targetInline = (0, index_js_1.formatCompact)(target);
    control.assert({
        success: (0, lessThan_js_1.lessThan)(target)(control.actual),
        reason: `The value ${actualInline} is not less than ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is less than ${targetInline}, but it was expected not to be.`,
    });
}
exports.toBeLessThan = toBeLessThan;
//# sourceMappingURL=toBeLessThan.js.map
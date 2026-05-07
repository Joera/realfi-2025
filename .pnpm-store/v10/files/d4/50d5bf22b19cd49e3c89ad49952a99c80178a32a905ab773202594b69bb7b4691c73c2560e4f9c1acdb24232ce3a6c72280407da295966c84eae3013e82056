"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeLessThanOrEqual = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const lessThanOrEqual_js_1 = require("../../matchers/numbers/lessThanOrEqual.js");
(0, expect_js_1.registerValidator)('toBeLessThanOrEqual', toBeLessThanOrEqual);
function toBeLessThanOrEqual(control, target) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const targetInline = (0, index_js_1.formatCompact)(target);
    control.assert({
        success: (0, lessThanOrEqual_js_1.lessThanOrEqual)(target)(control.actual),
        reason: `The value ${actualInline} is not less than or equal to ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is less than or equal to ${targetInline}, but it was expected not to be.`,
    });
}
exports.toBeLessThanOrEqual = toBeLessThanOrEqual;
//# sourceMappingURL=toBeLessThanOrEqual.js.map
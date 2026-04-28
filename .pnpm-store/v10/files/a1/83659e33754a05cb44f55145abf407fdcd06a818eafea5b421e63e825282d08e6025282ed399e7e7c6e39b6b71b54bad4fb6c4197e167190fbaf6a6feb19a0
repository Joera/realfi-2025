"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeBetween = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const between_js_1 = require("../../matchers/numbers/between.js");
(0, expect_js_1.registerValidator)('toBeBetween', toBeBetween);
function toBeBetween(control, min, max) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const minInline = (0, index_js_1.formatCompact)(min);
    const maxInline = (0, index_js_1.formatCompact)(max);
    control.assert({
        success: (0, between_js_1.between)(min, max)(control.actual),
        reason: `The value ${actualInline} is not between ${minInline} and ${maxInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is between ${minInline} and ${maxInline}, but it was expected not to be.`,
    });
}
exports.toBeBetween = toBeBetween;
//# sourceMappingURL=toBeBetween.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHaveSubset = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const subset_js_1 = require("../../matchers/objects/subset.js");
(0, expect_js_1.registerValidator)('toHaveSubset', toHaveSubset);
function toHaveSubset(control, expected) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const expectedInline = (0, index_js_1.formatCompact)(expected);
    control.assert({
        success: (0, subset_js_1.subset)(expected)(control.actual),
        reason: `The value ${actualInline} does not have a subset of ${expectedInline}, but it was expected to.`,
        negatedReason: `The value ${actualInline} does has a subset of ${expectedInline}, but it was expected not to.`,
    });
}
exports.toHaveSubset = toHaveSubset;
//# sourceMappingURL=toHaveSubset.js.map
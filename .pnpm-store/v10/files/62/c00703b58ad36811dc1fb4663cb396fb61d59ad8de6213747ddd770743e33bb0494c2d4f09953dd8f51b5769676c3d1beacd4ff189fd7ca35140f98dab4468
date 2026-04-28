"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSatisfy = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const satisfies_js_1 = require("../../matchers/custom/satisfies.js");
(0, expect_js_1.registerValidator)('toSatisfy', toSatisfy);
function toSatisfy(control, predicate) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, satisfies_js_1.satisfies)(predicate)(control.actual),
        reason: `The value ${actualInline} does not satisfy the given predicate, but it was expected to satisfy it.`,
        negatedReason: `The value ${actualInline} satisfies the given predicate, but it was expected not to satisfy it.`,
    });
}
exports.toSatisfy = toSatisfy;
//# sourceMappingURL=toSatisfy.js.map
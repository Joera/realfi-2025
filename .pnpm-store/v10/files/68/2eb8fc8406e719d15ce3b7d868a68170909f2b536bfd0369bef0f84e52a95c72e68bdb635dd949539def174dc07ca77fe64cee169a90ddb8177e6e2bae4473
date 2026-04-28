"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeNullish = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const nullish_js_1 = require("../../matchers/basic/nullish.js");
(0, expect_js_1.registerValidator)('toBeNullish', toBeNullish);
function toBeNullish(control) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, nullish_js_1.nullish)()(control.actual),
        reason: `The value ${actualInline} is not nullish, but it was expected to be nullish.`,
        negatedReason: `The value ${actualInline} is nullish, but it was expected not to be nullish.`,
    });
}
exports.toBeNullish = toBeNullish;
//# sourceMappingURL=toBeNullish.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLooseEqual = void 0;
const expect_js_1 = require("../../expect.js");
const FormatOptions_js_1 = require("../../format/FormatOptions.js");
const index_js_1 = require("../../format/index.js");
const index_js_2 = require("../../isEqual/index.js");
(0, expect_js_1.registerValidator)('toLooseEqual', toLooseEqual);
function toLooseEqual(control, expected) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const expectedInline = (0, index_js_1.formatCompact)(expected);
    control.assert({
        success: (0, index_js_2.isEqual)(control.actual, expected, index_js_2.LOOSE_EQUALITY_OPTIONS),
        reason: `The value ${actualInline} is not loosely equal to ${expectedInline}, but it was expected to be loosely equal.`,
        negatedReason: `The value ${actualInline} is loosely equal to ${expectedInline}, but it was expected not to be loosely equal.`,
        actual: (0, index_js_1.format)(control.actual, null, FormatOptions_js_1.LOOSE_FORMAT_OPTIONS),
        expected: (0, index_js_1.format)(expected, control.actual, FormatOptions_js_1.LOOSE_FORMAT_OPTIONS),
    });
}
exports.toLooseEqual = toLooseEqual;
//# sourceMappingURL=toLooseEqual.js.map
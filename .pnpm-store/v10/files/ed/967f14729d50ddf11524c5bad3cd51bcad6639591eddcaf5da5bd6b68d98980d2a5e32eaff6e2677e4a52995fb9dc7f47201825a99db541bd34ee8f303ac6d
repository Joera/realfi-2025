"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMatchRegex = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const regex_js_1 = require("../../matchers/basic/regex.js");
(0, expect_js_1.registerValidator)('toMatchRegex', toMatchRegex);
function toMatchRegex(control, expected) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const expectedInline = (0, index_js_1.formatCompact)(expected);
    control.assert({
        success: (0, regex_js_1.regex)(expected)(control.actual),
        reason: `The value ${actualInline} does not match ${expectedInline}, but it was expected to match.`,
        negatedReason: `The value ${actualInline} matches ${expectedInline}, but it was expected not to match.`,
    });
}
exports.toMatchRegex = toMatchRegex;
//# sourceMappingURL=toMatchRegex.js.map
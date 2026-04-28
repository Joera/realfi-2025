"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeEmpty = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const empty_js_1 = require("../../matchers/objects/empty.js");
(0, expect_js_1.registerValidator)('toBeEmpty', toBeEmpty);
function toBeEmpty(control) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, empty_js_1.empty)()(control.actual),
        reason: `The value ${actualInline} is not empty, but it was expected to be empty.`,
        negatedReason: `The value ${actualInline} is empty, but it was expected not to be empty.`,
    });
}
exports.toBeEmpty = toBeEmpty;
//# sourceMappingURL=toBeEmpty.js.map
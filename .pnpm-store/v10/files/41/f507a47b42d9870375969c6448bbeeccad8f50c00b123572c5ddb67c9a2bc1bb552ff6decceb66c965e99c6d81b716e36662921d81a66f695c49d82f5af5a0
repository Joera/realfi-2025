"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeTruthy = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const truthy_js_1 = require("../../matchers/basic/truthy.js");
(0, expect_js_1.registerValidator)('toBeTruthy', toBeTruthy);
function toBeTruthy(control) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, truthy_js_1.truthy)()(control.actual),
        reason: `The value ${actualInline} is not truthy, but it was expected to be truthy.`,
        negatedReason: `The value ${actualInline} is truthy, but it was expected not to be truthy.`,
    });
}
exports.toBeTruthy = toBeTruthy;
//# sourceMappingURL=toBeTruthy.js.map
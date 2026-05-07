"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBeFalsy = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const falsy_js_1 = require("../../matchers/basic/falsy.js");
(0, expect_js_1.registerValidator)('toBeFalsy', toBeFalsy);
function toBeFalsy(control) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, falsy_js_1.falsy)()(control.actual),
        reason: `The value ${actualInline} is not falsy, but it was expected to be falsy.`,
        negatedReason: `The value ${actualInline} is falsy, but it was expected not to be falsy.`,
    });
}
exports.toBeFalsy = toBeFalsy;
//# sourceMappingURL=toBeFalsy.js.map
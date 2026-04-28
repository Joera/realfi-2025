"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEqualUnsorted = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const index_js_2 = require("../../isEqual/index.js");
(0, expect_js_1.registerValidator)('toEqualUnsorted', toEqualUnsorted);
function toEqualUnsorted(control, expected) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    const expectedInline = (0, index_js_1.formatCompact)(expected);
    if (!Array.isArray(control.actual)) {
        return control.fail({
            reason: `The value ${actualInline} is not an array, but it was expected to be an array.`,
        });
    }
    if (!Array.isArray(expected)) {
        return control.fail({
            reason: `The argument ${expectedInline} is not an array, but it was expected to be an array.`,
        });
    }
    if (control.actual.length !== expected.length) {
        control.assert({
            success: false,
            reason: `The value ${actualInline} has a different length than ${expectedInline}, but is was expected to have the same length.`,
            negatedReason: '',
            actual: control.actual.length,
            expected: expected.length,
        });
    }
    // TODO: this algorithm works really bad with matchers. Is there another way to do this?
    const cloned = [...expected];
    let reordered = [];
    for (const item of control.actual) {
        const index = cloned.findIndex((c) => (0, index_js_2.isEqual)(item, c));
        if (index !== -1) {
            reordered.push(item);
            cloned.splice(index, 1);
        }
    }
    reordered = [...reordered, ...cloned];
    control.assert({
        success: (0, index_js_2.isEqual)(control.actual, reordered),
        reason: `The value ${actualInline} is not unsorted equal to ${expectedInline}, but it was expected to be unsorted equal.`,
        negatedReason: `The value ${actualInline} is unsorted equal to ${expectedInline}, but it was expected not to be unsorted equal.`,
        actual: control.actual,
        expected: reordered,
    });
}
exports.toEqualUnsorted = toEqualUnsorted;
//# sourceMappingURL=toEqualUnsorted.js.map
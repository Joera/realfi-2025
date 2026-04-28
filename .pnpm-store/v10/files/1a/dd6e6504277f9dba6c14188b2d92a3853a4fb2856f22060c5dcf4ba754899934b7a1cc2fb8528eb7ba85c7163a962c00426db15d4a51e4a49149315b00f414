"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTo = void 0;
const expect_js_1 = require("../../expect.js");
(0, expect_js_1.registerMatcher)('closeTo', closeTo);
function closeTo(target, delta) {
    const min = target - delta;
    const max = target + delta;
    return (value) => typeof value === 'number' && value >= min && value <= max;
}
exports.closeTo = closeTo;
//# sourceMappingURL=closeTo.js.map
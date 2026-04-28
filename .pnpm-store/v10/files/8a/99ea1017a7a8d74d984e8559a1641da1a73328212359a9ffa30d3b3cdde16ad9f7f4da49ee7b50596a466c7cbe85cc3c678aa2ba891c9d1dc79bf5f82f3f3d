"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.between = void 0;
const expect_js_1 = require("../../expect.js");
(0, expect_js_1.registerMatcher)('between', between);
function between(min, max) {
    const [realMin, realMax] = min < max ? [min, max] : [max, min];
    return (value) => (typeof value === 'number' || typeof value === 'bigint') &&
        value >= realMin &&
        value <= realMax;
}
exports.between = between;
//# sourceMappingURL=between.js.map
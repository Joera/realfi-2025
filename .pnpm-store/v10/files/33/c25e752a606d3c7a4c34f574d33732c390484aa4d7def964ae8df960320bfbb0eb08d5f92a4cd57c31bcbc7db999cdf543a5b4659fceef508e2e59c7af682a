"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeInteger = void 0;
const expect_js_1 = require("../../expect.js");
(0, expect_js_1.registerMatcher)('safeInteger', safeInteger);
function safeInteger() {
    return (value) => {
        if (typeof value === 'number' && !Number.isInteger(value)) {
            return false;
        }
        if (typeof value === 'number' || typeof value === 'bigint') {
            return (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER);
        }
        return false;
    };
}
exports.safeInteger = safeInteger;
//# sourceMappingURL=safeInteger.js.map
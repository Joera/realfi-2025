"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notEmpty = void 0;
const expect_js_1 = require("../../expect.js");
(0, expect_js_1.registerMatcher)('notEmpty', notEmpty);
function notEmpty() {
    return (value) => {
        if (typeof value === 'string')
            return value.length > 0;
        if (Array.isArray(value))
            return value.length > 0;
        if (value instanceof Set)
            return value.size > 0;
        if (value instanceof Map)
            return value.size > 0;
        return false;
    };
}
exports.notEmpty = notEmpty;
//# sourceMappingURL=notEmpty.js.map
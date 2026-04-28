"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regex = void 0;
const expect_js_1 = require("../../expect.js");
(0, expect_js_1.registerMatcher)('regex', regex);
function regex(regex) {
    return (value) => {
        if (typeof value !== 'string') {
            return false;
        }
        return regex.test(value);
    };
}
exports.regex = regex;
//# sourceMappingURL=regex.js.map
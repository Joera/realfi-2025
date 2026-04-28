"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.length = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../isEqual/index.js");
(0, expect_js_1.registerMatcher)('length', length);
function length(length) {
    return (value) => {
        const canCheck = (value != null && typeof value === 'object' && 'length' in value) ||
            typeof value === 'string';
        return canCheck && (0, index_js_1.isEqual)(value.length, length);
    };
}
exports.length = length;
//# sourceMappingURL=length.js.map
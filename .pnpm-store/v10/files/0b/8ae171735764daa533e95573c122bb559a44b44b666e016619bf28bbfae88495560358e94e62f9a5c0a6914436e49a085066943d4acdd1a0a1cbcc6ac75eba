"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subset = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../isEqual/index.js");
(0, expect_js_1.registerMatcher)('subset', subset);
function subset(subset) {
    if (!isObject(subset)) {
        return () => false;
    }
    return (value) => {
        if (!isObject(value)) {
            return false;
        }
        return Object.entries(subset).every(([key, expected]) => (0, index_js_1.isEqual)(value[key], expected));
    };
}
exports.subset = subset;
function isObject(value) {
    return (value != null && (typeof value === 'object' || typeof value === 'function'));
}
//# sourceMappingURL=subset.js.map
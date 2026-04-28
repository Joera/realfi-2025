"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqual = void 0;
const EqualityOptions_js_1 = require("./EqualityOptions.js");
const isEqualUnknown_js_1 = require("./isEqualUnknown.js");
/**
 * Equality algorithm used by all functions that check deep equality. Do not
 * confuse with `isEqual` validator.
 *
 * @see https://earl.dev/advanced/equality-algorithm.html
 */
function isEqual(value, other, options = EqualityOptions_js_1.DEFAULT_EQUALITY_OPTIONS) {
    return (0, isEqualUnknown_js_1.isEqualUnknown)(value, [], other, [], options);
}
exports.isEqual = isEqual;
//# sourceMappingURL=isEqual.js.map
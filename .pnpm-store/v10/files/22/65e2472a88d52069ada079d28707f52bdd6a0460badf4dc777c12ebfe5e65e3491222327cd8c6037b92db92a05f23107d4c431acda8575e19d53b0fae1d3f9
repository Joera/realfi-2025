"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualMap = void 0;
const isEqualUnknown_js_1 = require("./isEqualUnknown.js");
function isEqualMap(value, valueStack, other, otherStack, options) {
    if (value.size !== other.size) {
        return false;
    }
    for (const key of other.keys()) {
        if (!value.has(key)) {
            return false;
        }
    }
    valueStack.push(value);
    otherStack.push(other);
    let result = true;
    for (const [key, keyValue] of value.entries()) {
        if (!(0, isEqualUnknown_js_1.isEqualUnknown)(keyValue, valueStack, other.get(key), otherStack, options)) {
            result = false;
            break;
        }
    }
    valueStack.pop();
    otherStack.pop();
    return result;
}
exports.isEqualMap = isEqualMap;
//# sourceMappingURL=isEqualMap.js.map
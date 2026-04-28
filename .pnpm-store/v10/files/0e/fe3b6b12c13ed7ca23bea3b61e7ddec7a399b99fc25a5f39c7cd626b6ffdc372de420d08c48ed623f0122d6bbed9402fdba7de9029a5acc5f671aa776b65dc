"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualUnknown = void 0;
const expect_js_1 = require("../expect.js");
const getCanonicalType_js_1 = require("./getCanonicalType.js");
const isEqualMap_js_1 = require("./isEqualMap.js");
const isEqualNumber_js_1 = require("./isEqualNumber.js");
const isEqualObject_js_1 = require("./isEqualObject.js");
const isEqualSet_js_1 = require("./isEqualSet.js");
function isEqualUnknown(value, valueStack, other, otherStack, options) {
    if (other instanceof expect_js_1.Matcher) {
        return other.check(value);
    }
    const type = (0, getCanonicalType_js_1.getCanonicalType)(value);
    const otherType = (0, getCanonicalType_js_1.getCanonicalType)(other);
    if (type !== otherType) {
        return false;
    }
    switch (type) {
        case 'null':
        case 'undefined':
        case 'boolean':
        case 'bigint':
        case 'string':
        case 'symbol':
        case 'Function':
        case 'Promise':
        case 'WeakMap':
        case 'WeakSet':
            return value === other;
        case 'number':
            return (0, isEqualNumber_js_1.isEqualNumber)(value, other, options);
    }
    // This check is so late because of isEqualNumber
    if (value === other) {
        return true;
    }
    const valueIndex = valueStack.indexOf(value);
    const otherIndex = otherStack.indexOf(other);
    if (valueIndex !== -1 || otherIndex !== -1) {
        return valueIndex === otherIndex;
    }
    if (!options.ignorePrototypes) {
        if (Object.getPrototypeOf(value) !== Object.getPrototypeOf(other)) {
            return false;
        }
    }
    if (type === 'Array') {
        if (value.length !== other.length) {
            return false;
        }
    }
    else if (type === 'Set') {
        if (!(0, isEqualSet_js_1.isEqualSet)(value, other)) {
            return false;
        }
    }
    else if (type === 'Map') {
        if (!(0, isEqualMap_js_1.isEqualMap)(value, valueStack, other, otherStack, options)) {
            return false;
        }
    }
    else if (type === 'Date' ||
        type === 'String' ||
        type === 'Number' ||
        type === 'Boolean') {
        if (value.valueOf() !== other.valueOf()) {
            return false;
        }
    }
    else if (type === 'RegExp') {
        if (value.toString() !== other.toString()) {
            return false;
        }
    }
    return (0, isEqualObject_js_1.isEqualObject)(value, valueStack, other, otherStack, options, type);
}
exports.isEqualUnknown = isEqualUnknown;
//# sourceMappingURL=isEqualUnknown.js.map
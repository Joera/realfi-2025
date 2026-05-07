import { isEqualUnknown } from './isEqualUnknown.js';
export function isEqualMap(value, valueStack, other, otherStack, options) {
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
        if (!isEqualUnknown(keyValue, valueStack, other.get(key), otherStack, options)) {
            result = false;
            break;
        }
    }
    valueStack.pop();
    otherStack.pop();
    return result;
}
//# sourceMappingURL=isEqualMap.js.map
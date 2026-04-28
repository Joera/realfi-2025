export function getKeys(value, type, options) {
    let keys = Object.keys(value);
    if (type === 'Error') {
        addKey(keys, value, 'name');
        addKey(keys, value, 'message');
        addKey(keys, value, 'code');
        if (options.compareErrorStack) {
            addKey(keys, value, 'stack');
        }
        else {
            keys = keys.filter((key) => key !== 'stack');
        }
    }
    else if (type === 'String') {
        keys = keys.filter((key) => !/^\d+$/.test(key));
    }
    return keys.sort();
}
function addKey(keys, value, key) {
    if (key in value) {
        keys.push(key);
    }
}
//# sourceMappingURL=getKeys.js.map
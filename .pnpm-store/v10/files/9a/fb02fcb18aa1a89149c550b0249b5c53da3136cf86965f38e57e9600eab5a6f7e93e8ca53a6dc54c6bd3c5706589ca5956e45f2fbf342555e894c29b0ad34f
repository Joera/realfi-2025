"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionsWith = void 0;
function getOptionsWith(options, updates) {
    let hasModifications = false;
    for (const key of Object.keys(updates)) {
        if (options[key] !== updates[key]) {
            hasModifications = true;
        }
    }
    if (hasModifications) {
        return { ...options, ...updates };
    }
    return options;
}
exports.getOptionsWith = getOptionsWith;
//# sourceMappingURL=getOptionsWith.js.map
export function getOptionsWith(options, updates) {
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
//# sourceMappingURL=getOptionsWith.js.map
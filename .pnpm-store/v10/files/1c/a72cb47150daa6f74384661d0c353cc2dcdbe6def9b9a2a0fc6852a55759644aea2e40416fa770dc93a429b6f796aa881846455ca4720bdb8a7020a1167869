// TODO share with db-utils
export function postfixBigIntReplacer(k, v) {
    if (typeof v === 'bigint') {
        return v.toString() + 'n';
    }
    return v;
}
export function bigIntToStringReplacer(k, v) {
    if (typeof v === 'bigint') {
        return v.toString();
    }
    return v;
}
export function postfixBigIntReviver(k, v) {
    if (typeof v === 'string' &&
        (v.startsWith('-') ? !isNaN(parseInt(v.charAt(1))) : !isNaN(parseInt(v.charAt(0)))) &&
        v.charAt(v.length - 1) === 'n') {
        return BigInt(v.slice(0, -1));
    }
    return v;
}
export function JSONToString(json, space) {
    return JSON.stringify(json, bigIntToStringReplacer, space);
}
export function stringToJSON(str) {
    return JSON.parse(str);
}
/**
 * Convert a LinkedDataProvided object into LinkedData by turning every
 * bigint into its string representation (recursively).
 */
export function toJSONCompatibleLinkedData(input) {
    if (!input) {
        return undefined;
    }
    return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, walk(v)]));
}
/* ---------- internal helpers ---------- */
function walk(node) {
    if (typeof node === 'bigint')
        return node.toString();
    if (Array.isArray(node))
        return node.map(walk);
    if (node && typeof node === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(node))
            out[k] = walk(v);
        return out;
    }
    /* string | number | boolean | null */
    return node;
}
//# sourceMappingURL=json.js.map
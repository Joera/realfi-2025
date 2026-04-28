"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const FormatOptions_js_1 = require("./FormatOptions.js");
const formatUnknown_js_1 = require("./formatUnknown.js");
function format(value, sibling, options = FormatOptions_js_1.DEFAULT_FORMAT_OPTIONS) {
    const lines = (0, formatUnknown_js_1.formatUnknown)(value, sibling, options, [], []);
    return lines
        .map(([n, str]) => ' '.repeat(n * options.indentSize) + str)
        .join('\n');
}
exports.format = format;
//# sourceMappingURL=format.js.map
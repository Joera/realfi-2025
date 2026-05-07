import { DEFAULT_FORMAT_OPTIONS } from './FormatOptions.js';
import { formatUnknown } from './formatUnknown.js';
export function format(value, sibling, options = DEFAULT_FORMAT_OPTIONS) {
    const lines = formatUnknown(value, sibling, options, [], []);
    return lines
        .map(([n, str]) => ' '.repeat(n * options.indentSize) + str)
        .join('\n');
}
//# sourceMappingURL=format.js.map
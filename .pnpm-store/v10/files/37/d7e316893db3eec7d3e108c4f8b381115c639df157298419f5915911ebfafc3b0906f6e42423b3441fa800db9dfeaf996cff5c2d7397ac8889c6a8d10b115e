import { formatUnknown } from './formatUnknown.js';
import { getOptionsWith } from './getOptionsWith.js';
export function formatSetEntries(value, sibling, options, valueStack, siblingStack) {
    let inOrder = value;
    if (sibling instanceof Set) {
        inOrder = new Set();
        for (const item of sibling) {
            if (value.has(item)) {
                inOrder.add(item);
            }
        }
        for (const item of value) {
            inOrder.add(item);
        }
    }
    const valueItems = [...inOrder];
    const siblingItems = sibling instanceof Set ? [...sibling] : [];
    const passedOptions = getOptionsWith(options, {
        requireStrictEquality: true,
        skipMatcherReplacement: true,
        maxLineLength: options.maxLineLength - 10,
    });
    const entries = [];
    for (let i = 0; i < valueItems.length; i++) {
        const valueFormat = formatUnknown(valueItems[i], siblingItems[i], passedOptions, valueStack, siblingStack);
        for (const line of valueFormat) {
            line[0] += 1;
        }
        entries.push(...valueFormat);
    }
    return entries;
}
//# sourceMappingURL=formatSetEntries.js.map
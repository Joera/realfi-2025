import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { regex } from '../../matchers/basic/regex.js';
registerValidator('toMatchRegex', toMatchRegex);
export function toMatchRegex(control, expected) {
    const actualInline = formatCompact(control.actual);
    const expectedInline = formatCompact(expected);
    control.assert({
        success: regex(expected)(control.actual),
        reason: `The value ${actualInline} does not match ${expectedInline}, but it was expected to match.`,
        negatedReason: `The value ${actualInline} matches ${expectedInline}, but it was expected not to match.`,
    });
}
//# sourceMappingURL=toMatchRegex.js.map
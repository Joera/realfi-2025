import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { subset } from '../../matchers/objects/subset.js';
registerValidator('toHaveSubset', toHaveSubset);
export function toHaveSubset(control, expected) {
    const actualInline = formatCompact(control.actual);
    const expectedInline = formatCompact(expected);
    control.assert({
        success: subset(expected)(control.actual),
        reason: `The value ${actualInline} does not have a subset of ${expectedInline}, but it was expected to.`,
        negatedReason: `The value ${actualInline} does has a subset of ${expectedInline}, but it was expected not to.`,
    });
}
//# sourceMappingURL=toHaveSubset.js.map
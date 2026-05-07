import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { nullish } from '../../matchers/basic/nullish.js';
registerValidator('toBeNullish', toBeNullish);
export function toBeNullish(control) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: nullish()(control.actual),
        reason: `The value ${actualInline} is not nullish, but it was expected to be nullish.`,
        negatedReason: `The value ${actualInline} is nullish, but it was expected not to be nullish.`,
    });
}
//# sourceMappingURL=toBeNullish.js.map
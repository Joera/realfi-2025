import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { greaterThan } from '../../matchers/numbers/greaterThan.js';
registerValidator('toBeGreaterThan', toBeGreaterThan);
export function toBeGreaterThan(control, target) {
    const actualInline = formatCompact(control.actual);
    const targetInline = formatCompact(target);
    control.assert({
        success: greaterThan(target)(control.actual),
        reason: `The value ${actualInline} is not greater than ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is greater than ${targetInline}, but it was expected not to be.`,
    });
}
//# sourceMappingURL=toBeGreaterThan.js.map
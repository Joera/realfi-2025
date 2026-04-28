import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { greaterThanOrEqual } from '../../matchers/numbers/greaterThanOrEqual.js';
registerValidator('toBeGreaterThanOrEqual', toBeGreaterThanOrEqual);
export function toBeGreaterThanOrEqual(control, target) {
    const actualInline = formatCompact(control.actual);
    const targetInline = formatCompact(target);
    control.assert({
        success: greaterThanOrEqual(target)(control.actual),
        reason: `The value ${actualInline} is not greater than or equal to ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is greater than or equal to ${targetInline}, but it was expected not to be.`,
    });
}
//# sourceMappingURL=toBeGreaterThanOrEqual.js.map
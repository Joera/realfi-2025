import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { lessThanOrEqual } from '../../matchers/numbers/lessThanOrEqual.js';
registerValidator('toBeLessThanOrEqual', toBeLessThanOrEqual);
export function toBeLessThanOrEqual(control, target) {
    const actualInline = formatCompact(control.actual);
    const targetInline = formatCompact(target);
    control.assert({
        success: lessThanOrEqual(target)(control.actual),
        reason: `The value ${actualInline} is not less than or equal to ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is less than or equal to ${targetInline}, but it was expected not to be.`,
    });
}
//# sourceMappingURL=toBeLessThanOrEqual.js.map
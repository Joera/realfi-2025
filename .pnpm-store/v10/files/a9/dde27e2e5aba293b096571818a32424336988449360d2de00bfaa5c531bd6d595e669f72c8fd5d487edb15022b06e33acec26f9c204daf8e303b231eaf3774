import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { lessThan } from '../../matchers/numbers/lessThan.js';
registerValidator('toBeLessThan', toBeLessThan);
export function toBeLessThan(control, target) {
    const actualInline = formatCompact(control.actual);
    const targetInline = formatCompact(target);
    control.assert({
        success: lessThan(target)(control.actual),
        reason: `The value ${actualInline} is not less than ${targetInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is less than ${targetInline}, but it was expected not to be.`,
    });
}
//# sourceMappingURL=toBeLessThan.js.map
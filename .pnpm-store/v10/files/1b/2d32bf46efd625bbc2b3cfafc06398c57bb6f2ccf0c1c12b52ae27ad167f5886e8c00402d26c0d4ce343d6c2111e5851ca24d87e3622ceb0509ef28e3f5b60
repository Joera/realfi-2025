import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { closeTo } from '../../matchers/numbers/closeTo.js';
registerValidator('toBeCloseTo', toBeCloseTo);
export function toBeCloseTo(control, target, delta) {
    const actualInline = formatCompact(control.actual);
    const targetInline = formatCompact(target);
    const deltaInline = formatCompact(delta);
    control.assert({
        success: closeTo(target, delta)(control.actual),
        reason: `The value ${actualInline} is not close to ${targetInline} +/- ${deltaInline}, but it was expected to be close.`,
        negatedReason: `The value ${actualInline} is close to ${targetInline} +/- ${deltaInline}, but it was expected not to be close.`,
    });
}
//# sourceMappingURL=toBeCloseTo.js.map
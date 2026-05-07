import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { between } from '../../matchers/numbers/between.js';
registerValidator('toBeBetween', toBeBetween);
export function toBeBetween(control, min, max) {
    const actualInline = formatCompact(control.actual);
    const minInline = formatCompact(min);
    const maxInline = formatCompact(max);
    control.assert({
        success: between(min, max)(control.actual),
        reason: `The value ${actualInline} is not between ${minInline} and ${maxInline}, but it was expected to be.`,
        negatedReason: `The value ${actualInline} is between ${minInline} and ${maxInline}, but it was expected not to be.`,
    });
}
//# sourceMappingURL=toBeBetween.js.map
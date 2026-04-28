import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { safeInteger } from '../../matchers/numbers/safeInteger.js';
registerValidator('toBeASafeInteger', toBeASafeInteger);
export function toBeASafeInteger(control) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: safeInteger()(control.actual),
        reason: `The value ${actualInline} is not a safe integer, but it was expected to be a safe integer.`,
        negatedReason: `The value ${actualInline} is a safe integer, but it was expected not to be a safe integer.`,
    });
}
//# sourceMappingURL=toBeASafeInteger.js.map
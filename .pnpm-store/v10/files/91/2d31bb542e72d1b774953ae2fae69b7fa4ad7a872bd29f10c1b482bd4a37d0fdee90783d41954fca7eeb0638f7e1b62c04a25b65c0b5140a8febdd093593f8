import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { integer } from '../../matchers/numbers/integer.js';
registerValidator('toBeAnInteger', toBeAnInteger);
export function toBeAnInteger(control) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: integer()(control.actual),
        reason: `The value ${actualInline} is not an integer, but it was expected to be an integer.`,
        negatedReason: `The value ${actualInline} is an integer, but it was expected not to be an integer.`,
    });
}
//# sourceMappingURL=toBeAnInteger.js.map
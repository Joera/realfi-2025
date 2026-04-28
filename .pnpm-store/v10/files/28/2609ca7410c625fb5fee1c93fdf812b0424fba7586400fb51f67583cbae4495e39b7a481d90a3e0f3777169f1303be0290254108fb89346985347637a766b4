import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { empty } from '../../matchers/objects/empty.js';
registerValidator('toBeEmpty', toBeEmpty);
export function toBeEmpty(control) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: empty()(control.actual),
        reason: `The value ${actualInline} is not empty, but it was expected to be empty.`,
        negatedReason: `The value ${actualInline} is empty, but it was expected not to be empty.`,
    });
}
//# sourceMappingURL=toBeEmpty.js.map
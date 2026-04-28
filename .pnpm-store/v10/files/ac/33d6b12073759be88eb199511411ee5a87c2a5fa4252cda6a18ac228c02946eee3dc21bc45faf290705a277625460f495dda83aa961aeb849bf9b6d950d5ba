import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { truthy } from '../../matchers/basic/truthy.js';
registerValidator('toBeTruthy', toBeTruthy);
export function toBeTruthy(control) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: truthy()(control.actual),
        reason: `The value ${actualInline} is not truthy, but it was expected to be truthy.`,
        negatedReason: `The value ${actualInline} is truthy, but it was expected not to be truthy.`,
    });
}
//# sourceMappingURL=toBeTruthy.js.map
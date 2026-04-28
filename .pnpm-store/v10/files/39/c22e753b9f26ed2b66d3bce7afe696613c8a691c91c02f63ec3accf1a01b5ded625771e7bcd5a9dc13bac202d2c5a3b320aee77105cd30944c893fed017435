import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { falsy } from '../../matchers/basic/falsy.js';
registerValidator('toBeFalsy', toBeFalsy);
export function toBeFalsy(control) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: falsy()(control.actual),
        reason: `The value ${actualInline} is not falsy, but it was expected to be falsy.`,
        negatedReason: `The value ${actualInline} is falsy, but it was expected not to be falsy.`,
    });
}
//# sourceMappingURL=toBeFalsy.js.map
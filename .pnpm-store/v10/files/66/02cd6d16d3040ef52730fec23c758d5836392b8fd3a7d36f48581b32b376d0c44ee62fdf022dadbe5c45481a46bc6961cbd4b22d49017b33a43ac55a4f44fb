import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { satisfies } from '../../matchers/custom/satisfies.js';
registerValidator('toSatisfy', toSatisfy);
export function toSatisfy(control, predicate) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: satisfies(predicate)(control.actual),
        reason: `The value ${actualInline} does not satisfy the given predicate, but it was expected to satisfy it.`,
        negatedReason: `The value ${actualInline} satisfies the given predicate, but it was expected not to satisfy it.`,
    });
}
//# sourceMappingURL=toSatisfy.js.map
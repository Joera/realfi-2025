import { registerValidator } from '../../expect.js';
import { formatCompact } from '../../format/index.js';
import { schema } from '../../matchers/custom/schema.js';
registerValidator('toMatchSchema', toMatchSchema);
export function toMatchSchema(control, expected) {
    const actualInline = formatCompact(control.actual);
    control.assert({
        success: schema(expected)(control.actual),
        reason: `The value ${actualInline} does not match the given schema, but it was expected to match.`,
        negatedReason: `The value ${actualInline} matches the given schema, but it was expected not to match.`,
    });
}
//# sourceMappingURL=toMatchSchema.js.map
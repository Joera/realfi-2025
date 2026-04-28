"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMatchSchema = void 0;
const expect_js_1 = require("../../expect.js");
const index_js_1 = require("../../format/index.js");
const schema_js_1 = require("../../matchers/custom/schema.js");
(0, expect_js_1.registerValidator)('toMatchSchema', toMatchSchema);
function toMatchSchema(control, expected) {
    const actualInline = (0, index_js_1.formatCompact)(control.actual);
    control.assert({
        success: (0, schema_js_1.schema)(expected)(control.actual),
        reason: `The value ${actualInline} does not match the given schema, but it was expected to match.`,
        negatedReason: `The value ${actualInline} matches the given schema, but it was expected not to match.`,
    });
}
exports.toMatchSchema = toMatchSchema;
//# sourceMappingURL=toMatchSchema.js.map
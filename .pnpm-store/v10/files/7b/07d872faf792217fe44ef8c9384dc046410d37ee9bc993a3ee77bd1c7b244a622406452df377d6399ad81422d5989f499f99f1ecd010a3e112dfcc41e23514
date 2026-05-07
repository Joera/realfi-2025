"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const expect_js_1 = require("../../expect.js");
(0, expect_js_1.registerMatcher)('schema', schema, () => 'schema(???)');
function schema(schema) {
    return (value) => {
        try {
            schema.parse(value);
            return true;
        }
        catch {
            return false;
        }
    };
}
exports.schema = schema;
//# sourceMappingURL=schema.js.map
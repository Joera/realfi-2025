import { registerMatcher } from '../../expect.js';
registerMatcher('schema', schema, () => 'schema(???)');
export function schema(schema) {
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
//# sourceMappingURL=schema.js.map
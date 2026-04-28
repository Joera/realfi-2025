import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
export class TupleValue extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.TupleValue;
        if (ast.expression) {
            this.expression = extractVariant(new Expression(ast.expression, options));
        }
        this.updateMetadata(this.expression);
    }
    print(path, print) {
        return path.call(print, 'expression');
    }
}
//# sourceMappingURL=TupleValue.js.map
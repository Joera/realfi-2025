import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TupleValues } from './TupleValues.js';
export class TupleExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.TupleExpression;
        this.items = new TupleValues(ast.items, options);
    }
    print(path, print) {
        return ['(', path.call(print, 'items'), ')'];
    }
}
//# sourceMappingURL=TupleExpression.js.map
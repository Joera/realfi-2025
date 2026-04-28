import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ArrayValues } from './ArrayValues.js';
export class ArrayExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ArrayExpression;
        this.items = new ArrayValues(ast.items, options);
    }
    print(path, print) {
        return ['[', path.call(print, 'items'), ']'];
    }
}
//# sourceMappingURL=ArrayExpression.js.map
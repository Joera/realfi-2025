import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
export class UsingOperator extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.UsingOperator;
        this.variant = ast.variant.unparse();
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=UsingOperator.js.map
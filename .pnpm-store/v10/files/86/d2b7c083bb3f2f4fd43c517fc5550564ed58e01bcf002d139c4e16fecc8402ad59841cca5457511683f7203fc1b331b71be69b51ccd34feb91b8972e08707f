import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
export class NumberUnit extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.NumberUnit;
        this.variant = ast.variant.unparse();
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=NumberUnit.js.map
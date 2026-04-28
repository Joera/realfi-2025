import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
export class VersionOperator extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.VersionOperator;
        this.variant = ast.variant.unparse();
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=VersionOperator.js.map
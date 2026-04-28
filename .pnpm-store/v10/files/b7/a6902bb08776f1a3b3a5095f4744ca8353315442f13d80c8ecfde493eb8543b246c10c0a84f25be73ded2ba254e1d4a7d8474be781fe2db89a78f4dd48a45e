import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
export class SimpleVersionLiteral extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.SimpleVersionLiteral;
        this.items = ast.items.map((item) => item.unparse());
    }
    print() {
        return this.items.join('.');
    }
}
//# sourceMappingURL=SimpleVersionLiteral.js.map
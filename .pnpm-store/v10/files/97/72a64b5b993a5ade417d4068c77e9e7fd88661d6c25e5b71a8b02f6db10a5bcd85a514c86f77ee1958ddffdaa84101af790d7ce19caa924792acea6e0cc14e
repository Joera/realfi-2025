import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printString } from '../slang-printers/print-string.js';
import { SlangNode } from './SlangNode.js';
export class StringLiteral extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.StringLiteral;
        this.variant = ast.variant.unparse();
        this.variant = printString(this.variant.slice(1, -1), options);
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=StringLiteral.js.map
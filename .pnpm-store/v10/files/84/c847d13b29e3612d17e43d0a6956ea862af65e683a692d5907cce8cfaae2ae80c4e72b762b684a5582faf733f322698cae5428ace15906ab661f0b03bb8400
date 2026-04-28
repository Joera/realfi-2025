import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printString } from '../slang-printers/print-string.js';
import { SlangNode } from './SlangNode.js';
export class HexStringLiteral extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.HexStringLiteral;
        this.variant = ast.variant.unparse();
        this.variant = `hex${printString(this.variant.slice(4, -1), options)}`;
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=HexStringLiteral.js.map
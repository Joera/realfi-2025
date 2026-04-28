import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { StringLiteral } from './StringLiteral.js';
const { join, hardline } = doc.builders;
export class StringLiterals extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.StringLiterals;
        this.items = ast.items.map((item) => new StringLiteral(item, options));
    }
    print(path, print) {
        return join(hardline, path.map(print, 'items'));
    }
}
//# sourceMappingURL=StringLiterals.js.map
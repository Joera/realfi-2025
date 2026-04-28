import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { HexStringLiteral } from './HexStringLiteral.js';
const { join, hardline } = doc.builders;
export class HexStringLiterals extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.HexStringLiterals;
        this.items = ast.items.map((item) => new HexStringLiteral(item, options));
    }
    print(path, print) {
        return join(hardline, path.map(print, 'items'));
    }
}
//# sourceMappingURL=HexStringLiterals.js.map
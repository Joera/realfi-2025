import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { StringLiteral } from './StringLiteral.js';
export class AssemblyFlags extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.AssemblyFlags;
        this.items = ast.items.map((item) => new StringLiteral(item, options));
    }
    print(path, print) {
        return printSeparatedList(path.map(print, 'items'));
    }
}
//# sourceMappingURL=AssemblyFlags.js.map
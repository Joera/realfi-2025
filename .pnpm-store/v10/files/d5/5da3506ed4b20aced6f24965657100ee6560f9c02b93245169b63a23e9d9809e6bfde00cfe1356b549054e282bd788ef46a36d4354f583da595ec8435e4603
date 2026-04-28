import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { IdentifierPath } from './IdentifierPath.js';
export class OverridePaths extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.OverridePaths;
        this.items = ast.items.map((item) => new IdentifierPath(item));
    }
    print(path, print) {
        return printSeparatedList(path.map(print, 'items'));
    }
}
//# sourceMappingURL=OverridePaths.js.map
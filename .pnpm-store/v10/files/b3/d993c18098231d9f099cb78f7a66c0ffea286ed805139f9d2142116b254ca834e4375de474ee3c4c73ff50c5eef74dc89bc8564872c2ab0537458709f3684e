import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
export class YulParameters extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.YulParameters;
        this.items = ast.items.map((item) => new TerminalNode(item));
    }
    print(path, print) {
        return printSeparatedList(path.map(print, 'items'));
    }
}
//# sourceMappingURL=YulParameters.js.map
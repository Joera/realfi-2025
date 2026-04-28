import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
const { line } = doc.builders;
export class YulVariableNames extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.YulVariableNames;
        this.items = ast.items.map((item) => new TerminalNode(item));
    }
    print(path, print) {
        return printSeparatedList(path.map(print, 'items'), {
            firstSeparator: line,
            lastSeparator: ''
        });
    }
}
//# sourceMappingURL=YulVariableNames.js.map
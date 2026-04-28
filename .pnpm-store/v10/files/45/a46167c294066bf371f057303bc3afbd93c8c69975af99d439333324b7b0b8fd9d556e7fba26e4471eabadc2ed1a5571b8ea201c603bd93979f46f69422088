import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printSeparatedItem } from '../slang-printers/print-separated-item.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulStackAssignmentOperator } from './YulStackAssignmentOperator.js';
import { TerminalNode } from './TerminalNode.js';
const { line } = doc.builders;
export class YulStackAssignmentStatement extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.YulStackAssignmentStatement;
        this.assignment = extractVariant(new YulStackAssignmentOperator(ast.assignment));
        this.variable = new TerminalNode(ast.variable);
        this.updateMetadata(this.assignment);
    }
    print(path, print) {
        return [
            path.call(print, 'assignment'),
            printSeparatedItem(path.call(print, 'variable'), {
                firstSeparator: line,
                lastSeparator: ''
            })
        ];
    }
}
//# sourceMappingURL=YulStackAssignmentStatement.js.map
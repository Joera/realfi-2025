import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { isBinaryOperation } from '../slang-utils/is-binary-operation.js';
import { SlangNode } from './SlangNode.js';
import { TupleValue } from './TupleValue.js';
import { TerminalNode } from './TerminalNode.js';
export class TupleValues extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.TupleValues;
        this.items = ast.items.map((item) => new TupleValue(item, options));
    }
    getSingleExpression() {
        const items = this.items;
        return items.length === 1 ? items[0].expression : undefined;
    }
    print(path, print) {
        const singleExpression = this.getSingleExpression();
        const items = path.map(print, 'items');
        return singleExpression &&
            !(singleExpression instanceof TerminalNode) &&
            isBinaryOperation(singleExpression)
            ? items
            : printSeparatedList(items);
    }
}
//# sourceMappingURL=TupleValues.js.map
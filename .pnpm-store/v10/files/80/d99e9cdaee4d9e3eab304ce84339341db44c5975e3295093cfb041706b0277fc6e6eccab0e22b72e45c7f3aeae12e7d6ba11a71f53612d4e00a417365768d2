import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { TupleDeconstructionElement } from './TupleDeconstructionElement.js';
export class TupleDeconstructionElements extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.TupleDeconstructionElements;
        this.items = ast.items.map((item) => new TupleDeconstructionElement(item, options));
    }
    print(path, print) {
        return printSeparatedList(path.map(print, 'items'));
    }
}
//# sourceMappingURL=TupleDeconstructionElements.js.map
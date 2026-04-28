import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { EventParameter } from './EventParameter.js';
export class EventParameters extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.EventParameters;
        this.items = ast.items.map((item) => new EventParameter(item, options));
    }
    print(path, print) {
        return this.items.length > 0
            ? printSeparatedList(path.map(print, 'items'))
            : '';
    }
}
//# sourceMappingURL=EventParameters.js.map
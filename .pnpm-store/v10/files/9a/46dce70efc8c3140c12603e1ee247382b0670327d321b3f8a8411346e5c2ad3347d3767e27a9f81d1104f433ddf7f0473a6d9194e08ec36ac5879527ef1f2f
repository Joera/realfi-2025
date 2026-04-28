import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { printSeparatedItem } from '../slang-printers/print-separated-item.js';
import { printComments } from '../slang-printers/print-comments.js';
import { SlangNode } from './SlangNode.js';
import { Parameter } from './Parameter.js';
export class Parameters extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.Parameters;
        this.items = ast.items.map((item) => new Parameter(item, options));
    }
    print(path, print, options) {
        if (this.items.length > 0) {
            return printSeparatedList(path.map(print, 'items'), { grouped: false });
        }
        const parameterComments = printComments(path, options);
        return parameterComments.length > 0
            ? printSeparatedItem(parameterComments)
            : '';
    }
}
//# sourceMappingURL=Parameters.js.map
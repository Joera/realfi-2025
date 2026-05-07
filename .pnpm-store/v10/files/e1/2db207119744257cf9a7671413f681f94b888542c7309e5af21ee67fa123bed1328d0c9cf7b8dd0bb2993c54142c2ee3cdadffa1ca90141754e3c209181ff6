import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
export class IndexAccessEnd extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.IndexAccessEnd;
        if (ast.end) {
            this.end = extractVariant(new Expression(ast.end, options));
        }
        this.updateMetadata(this.end);
    }
    print(path, print) {
        return [':', path.call(print, 'end')];
    }
}
//# sourceMappingURL=IndexAccessEnd.js.map
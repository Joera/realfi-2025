import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { VersionExpressionSet } from './VersionExpressionSet.js';
const { join } = doc.builders;
export class VersionExpressionSets extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.VersionExpressionSets;
        this.items = ast.items.map((item) => new VersionExpressionSet(item));
    }
    print(path, print) {
        return join(' || ', path.map(print, 'items'));
    }
}
//# sourceMappingURL=VersionExpressionSets.js.map
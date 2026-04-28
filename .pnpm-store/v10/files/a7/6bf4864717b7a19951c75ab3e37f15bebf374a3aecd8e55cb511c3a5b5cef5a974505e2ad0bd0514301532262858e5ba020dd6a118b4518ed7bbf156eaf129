import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { CatchClause } from './CatchClause.js';
const { join } = doc.builders;
export class CatchClauses extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.CatchClauses;
        this.items = ast.items.map((item) => new CatchClause(item, options));
        this.updateMetadata(...this.items);
    }
    print(path, print) {
        return join(' ', path.map(print, 'items'));
    }
}
//# sourceMappingURL=CatchClauses.js.map
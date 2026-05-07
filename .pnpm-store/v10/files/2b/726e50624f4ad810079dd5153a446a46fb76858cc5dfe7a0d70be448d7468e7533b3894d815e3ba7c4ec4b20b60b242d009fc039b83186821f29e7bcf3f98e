import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { CatchClauseError } from './CatchClauseError.js';
import { Block } from './Block.js';
export class CatchClause extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.CatchClause;
        if (ast.error) {
            this.error = new CatchClauseError(ast.error, options);
        }
        this.body = new Block(ast.body, options);
        this.updateMetadata(this.error, this.body);
    }
    print(path, print) {
        return ['catch ', path.call(print, 'error'), path.call(print, 'body')];
    }
}
//# sourceMappingURL=CatchClause.js.map
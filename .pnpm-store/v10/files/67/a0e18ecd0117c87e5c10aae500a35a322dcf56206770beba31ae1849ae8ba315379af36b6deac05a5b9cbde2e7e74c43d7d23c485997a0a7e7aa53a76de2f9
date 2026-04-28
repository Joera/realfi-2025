import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { Statements } from './Statements.js';
export class Block extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.Block;
        this.statements = new Statements(ast.statements, options);
        this.updateMetadata(this.statements);
    }
    print(path, print) {
        return ['{', path.call(print, 'statements'), '}'];
    }
}
//# sourceMappingURL=Block.js.map
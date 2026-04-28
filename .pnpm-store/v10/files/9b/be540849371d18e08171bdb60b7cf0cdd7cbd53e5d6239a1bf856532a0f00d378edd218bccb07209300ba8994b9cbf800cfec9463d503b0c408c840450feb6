import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
export class ImportAlias extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.ImportAlias;
        this.identifier = new TerminalNode(ast.identifier);
    }
    print(path, print) {
        return [' as ', path.call(print, 'identifier')];
    }
}
//# sourceMappingURL=ImportAlias.js.map
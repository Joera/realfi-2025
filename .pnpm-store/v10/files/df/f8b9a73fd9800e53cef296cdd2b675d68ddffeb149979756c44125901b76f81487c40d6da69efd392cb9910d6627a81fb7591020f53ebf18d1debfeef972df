import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
const { join } = doc.builders;
export class IdentifierPath extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.IdentifierPath;
        this.items = ast.items.map((item) => new TerminalNode(item));
    }
    print(path, print) {
        return join('.', path.map(print, 'items'));
    }
}
//# sourceMappingURL=IdentifierPath.js.map
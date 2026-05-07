import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { LibraryMembers } from './LibraryMembers.js';
const { group, line } = doc.builders;
export class LibraryDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.LibraryDefinition;
        this.name = new TerminalNode(ast.name);
        this.members = new LibraryMembers(ast.members, options);
        this.updateMetadata(this.members);
    }
    print(path, print) {
        return [
            group(['library ', path.call(print, 'name'), line, '{']),
            path.call(print, 'members'),
            '}'
        ];
    }
}
//# sourceMappingURL=LibraryDefinition.js.map
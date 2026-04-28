import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { StructMembers } from './StructMembers.js';
export class StructDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.StructDefinition;
        this.name = new TerminalNode(ast.name);
        this.members = new StructMembers(ast.members, options);
        this.updateMetadata(this.members);
    }
    print(path, print) {
        return [
            'struct ',
            path.call(print, 'name'),
            ' {',
            path.call(print, 'members'),
            '}'
        ];
    }
}
//# sourceMappingURL=StructDefinition.js.map
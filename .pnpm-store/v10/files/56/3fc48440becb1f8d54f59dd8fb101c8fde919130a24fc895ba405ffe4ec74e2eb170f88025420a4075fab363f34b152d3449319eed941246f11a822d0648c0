import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { EnumMembers } from './EnumMembers.js';
export class EnumDefinition extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.EnumDefinition;
        this.name = new TerminalNode(ast.name);
        this.members = new EnumMembers(ast.members);
        this.updateMetadata(this.members);
    }
    print(path, print) {
        return [
            'enum ',
            path.call(print, 'name'),
            ' {',
            path.call(print, 'members'),
            '}'
        ];
    }
}
//# sourceMappingURL=EnumDefinition.js.map
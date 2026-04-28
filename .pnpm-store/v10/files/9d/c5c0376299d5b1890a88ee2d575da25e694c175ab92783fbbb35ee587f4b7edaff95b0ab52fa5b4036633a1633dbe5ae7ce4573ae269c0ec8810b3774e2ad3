import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { ErrorParametersDeclaration } from './ErrorParametersDeclaration.js';
export class ErrorDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ErrorDefinition;
        this.name = new TerminalNode(ast.name);
        this.members = new ErrorParametersDeclaration(ast.members, options);
        this.updateMetadata(this.members);
    }
    print(path, print) {
        return [
            'error ',
            path.call(print, 'name'),
            path.call(print, 'members'),
            ';'
        ];
    }
}
//# sourceMappingURL=ErrorDefinition.js.map
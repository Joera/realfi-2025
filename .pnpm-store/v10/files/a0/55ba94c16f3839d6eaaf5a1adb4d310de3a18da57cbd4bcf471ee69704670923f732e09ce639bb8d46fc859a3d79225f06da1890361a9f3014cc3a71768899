import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { NamedArgumentGroup } from './NamedArgumentGroup.js';
export class NamedArgumentsDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.NamedArgumentsDeclaration;
        if (ast.arguments) {
            this.arguments = new NamedArgumentGroup(ast.arguments, options);
        }
        this.updateMetadata(this.arguments);
    }
    print(path, print) {
        return ['(', path.call(print, 'arguments'), ')'];
    }
}
//# sourceMappingURL=NamedArgumentsDeclaration.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { AssemblyFlags } from './AssemblyFlags.js';
export class AssemblyFlagsDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.AssemblyFlagsDeclaration;
        this.flags = new AssemblyFlags(ast.flags, options);
        this.updateMetadata(this.flags);
    }
    print(path, print) {
        return ['(', path.call(print, 'flags'), ')'];
    }
}
//# sourceMappingURL=AssemblyFlagsDeclaration.js.map
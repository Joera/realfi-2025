import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { InheritanceTypes } from './InheritanceTypes.js';
export class InheritanceSpecifier extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.InheritanceSpecifier;
        this.types = new InheritanceTypes(ast.types, options);
        this.updateMetadata(this.types);
    }
    print(path, print) {
        return ['is', path.call(print, 'types')];
    }
}
//# sourceMappingURL=InheritanceSpecifier.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { OverridePathsDeclaration } from './OverridePathsDeclaration.js';
export class OverrideSpecifier extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.OverrideSpecifier;
        if (ast.overridden) {
            this.overridden = new OverridePathsDeclaration(ast.overridden);
        }
        this.updateMetadata(this.overridden);
    }
    print(path, print) {
        return ['override', path.call(print, 'overridden')];
    }
}
//# sourceMappingURL=OverrideSpecifier.js.map
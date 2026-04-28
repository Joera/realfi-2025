import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { OverridePaths } from './OverridePaths.js';
export class OverridePathsDeclaration extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.OverridePathsDeclaration;
        this.paths = new OverridePaths(ast.paths);
        this.updateMetadata(this.paths);
    }
    print(path, print) {
        return ['(', path.call(print, 'paths'), ')'];
    }
}
//# sourceMappingURL=OverridePathsDeclaration.js.map
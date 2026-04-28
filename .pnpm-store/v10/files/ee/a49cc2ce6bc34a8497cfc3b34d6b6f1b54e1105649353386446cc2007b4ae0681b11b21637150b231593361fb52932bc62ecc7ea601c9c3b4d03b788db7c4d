import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { VersionExpressionSets } from './VersionExpressionSets.js';
export class VersionPragma extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.VersionPragma;
        this.sets = new VersionExpressionSets(ast.sets);
        this.updateMetadata(this.sets);
    }
    print(path, print) {
        return ['solidity ', path.call(print, 'sets')];
    }
}
//# sourceMappingURL=VersionPragma.js.map
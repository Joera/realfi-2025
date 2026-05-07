import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { IdentifierPath } from './IdentifierPath.js';
import { UsingAlias } from './UsingAlias.js';
export class UsingDeconstructionSymbol extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.UsingDeconstructionSymbol;
        this.name = new IdentifierPath(ast.name);
        if (ast.alias) {
            this.alias = new UsingAlias(ast.alias);
        }
        this.updateMetadata(this.name, this.alias);
    }
    print(path, print) {
        return [path.call(print, 'name'), path.call(print, 'alias')];
    }
}
//# sourceMappingURL=UsingDeconstructionSymbol.js.map
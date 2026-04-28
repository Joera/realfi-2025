import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { ImportAlias } from './ImportAlias.js';
export class ImportDeconstructionSymbol extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.ImportDeconstructionSymbol;
        this.name = new TerminalNode(ast.name);
        if (ast.alias) {
            this.alias = new ImportAlias(ast.alias);
        }
        this.updateMetadata(this.alias);
    }
    print(path, print) {
        return [path.call(print, 'name'), path.call(print, 'alias')];
    }
}
//# sourceMappingURL=ImportDeconstructionSymbol.js.map
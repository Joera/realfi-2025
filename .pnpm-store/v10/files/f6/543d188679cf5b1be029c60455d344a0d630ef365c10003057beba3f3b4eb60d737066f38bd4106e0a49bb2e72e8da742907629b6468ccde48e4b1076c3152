import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ImportDeconstructionSymbols } from './ImportDeconstructionSymbols.js';
import { StringLiteral } from './StringLiteral.js';
export class ImportDeconstruction extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ImportDeconstruction;
        this.symbols = new ImportDeconstructionSymbols(ast.symbols);
        this.path = new StringLiteral(ast.path, options);
        this.updateMetadata(this.symbols, this.path);
    }
    print(path, print) {
        return [
            '{',
            path.call(print, 'symbols'),
            '} from ',
            path.call(print, 'path')
        ];
    }
}
//# sourceMappingURL=ImportDeconstruction.js.map
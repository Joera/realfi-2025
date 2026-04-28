import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ImportClause } from './ImportClause.js';
export class ImportDirective extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ImportDirective;
        this.clause = extractVariant(new ImportClause(ast.clause, options));
        this.updateMetadata(this.clause);
    }
    print(path, print) {
        return ['import ', path.call(print, 'clause'), ';'];
    }
}
//# sourceMappingURL=ImportDirective.js.map
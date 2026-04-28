import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { PathImport } from './PathImport.js';
import { NamedImport } from './NamedImport.js';
import { ImportDeconstruction } from './ImportDeconstruction.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.PathImport) {
        return new PathImport(variant, options);
    }
    if (variant instanceof ast.NamedImport) {
        return new NamedImport(variant, options);
    }
    if (variant instanceof ast.ImportDeconstruction) {
        return new ImportDeconstruction(variant, options);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class ImportClause extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ImportClause;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ImportClause.js.map
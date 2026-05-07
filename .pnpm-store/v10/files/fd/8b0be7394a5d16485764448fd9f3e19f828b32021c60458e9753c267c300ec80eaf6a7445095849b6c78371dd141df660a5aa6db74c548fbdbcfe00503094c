import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { StringLiteral } from './StringLiteral.js';
import { ImportAlias } from './ImportAlias.js';
export class PathImport extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.PathImport;
        this.path = new StringLiteral(ast.path, options);
        if (ast.alias) {
            this.alias = new ImportAlias(ast.alias);
        }
        this.updateMetadata(this.path, this.alias);
    }
    print(path, print) {
        return [path.call(print, 'path'), path.call(print, 'alias')];
    }
}
//# sourceMappingURL=PathImport.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ImportAlias } from './ImportAlias.js';
import { StringLiteral } from './StringLiteral.js';
export class NamedImport extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.NamedImport;
        this.alias = new ImportAlias(ast.alias);
        this.path = new StringLiteral(ast.path, options);
        this.updateMetadata(this.alias, this.path);
    }
    print(path, print) {
        return ['*', path.call(print, 'alias'), ' from ', path.call(print, 'path')];
    }
}
//# sourceMappingURL=NamedImport.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
export class TypeExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.TypeExpression;
        this.typeName = extractVariant(new TypeName(ast.typeName, options));
        this.updateMetadata(this.typeName);
    }
    print(path, print) {
        return ['type(', path.call(print, 'typeName'), ')'];
    }
}
//# sourceMappingURL=TypeExpression.js.map
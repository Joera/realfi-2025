import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
export class NewExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.NewExpression;
        this.typeName = extractVariant(new TypeName(ast.typeName, options));
        this.updateMetadata(this.typeName);
    }
    print(path, print) {
        return ['new ', path.call(print, 'typeName')];
    }
}
//# sourceMappingURL=NewExpression.js.map
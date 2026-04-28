import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { VersionExpression } from './VersionExpression.js';
const { join } = doc.builders;
export class VersionExpressionSet extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.VersionExpressionSet;
        this.items = ast.items.map((item) => extractVariant(new VersionExpression(item)));
    }
    print(path, print) {
        return join(' ', path.map(print, 'items'));
    }
}
//# sourceMappingURL=VersionExpressionSet.js.map
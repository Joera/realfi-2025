import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulFunctionCallExpression } from './YulFunctionCallExpression.js';
import { YulLiteral } from './YulLiteral.js';
import { YulPath } from './YulPath.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.YulFunctionCallExpression) {
        return new YulFunctionCallExpression(variant, options);
    }
    if (variant instanceof ast.YulLiteral) {
        return extractVariant(new YulLiteral(variant, options));
    }
    if (variant instanceof ast.YulPath) {
        return new YulPath(variant);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class YulExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulExpression;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=YulExpression.js.map
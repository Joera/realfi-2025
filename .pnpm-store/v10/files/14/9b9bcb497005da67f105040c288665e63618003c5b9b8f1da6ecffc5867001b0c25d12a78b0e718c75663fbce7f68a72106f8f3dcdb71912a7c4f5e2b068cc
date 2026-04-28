import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulExpression } from './YulExpression.js';
import { YulArguments } from './YulArguments.js';
export class YulFunctionCallExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulFunctionCallExpression;
        this.operand = extractVariant(new YulExpression(ast.operand, options));
        this.arguments = new YulArguments(ast.arguments, options);
        this.updateMetadata(this.operand, this.arguments);
    }
    print(path, print) {
        return [
            path.call(print, 'operand'),
            '(',
            path.call(print, 'arguments'),
            ')'
        ];
    }
}
//# sourceMappingURL=YulFunctionCallExpression.js.map
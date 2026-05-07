import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulAssignmentOperator } from './YulAssignmentOperator.js';
import { YulExpression } from './YulExpression.js';
export class YulVariableDeclarationValue extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulVariableDeclarationValue;
        this.assignment = extractVariant(new YulAssignmentOperator(ast.assignment));
        this.expression = extractVariant(new YulExpression(ast.expression, options));
        this.updateMetadata(this.assignment, this.expression);
    }
    print(path, print) {
        return [
            path.call(print, 'assignment'),
            ' ',
            path.call(print, 'expression')
        ];
    }
}
//# sourceMappingURL=YulVariableDeclarationValue.js.map
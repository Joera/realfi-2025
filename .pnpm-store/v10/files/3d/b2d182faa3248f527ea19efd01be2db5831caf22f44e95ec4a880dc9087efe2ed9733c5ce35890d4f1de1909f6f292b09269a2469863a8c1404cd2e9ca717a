import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulPaths } from './YulPaths.js';
import { YulAssignmentOperator } from './YulAssignmentOperator.js';
import { YulExpression } from './YulExpression.js';
const { join } = doc.builders;
export class YulVariableAssignmentStatement extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulVariableAssignmentStatement;
        this.variables = new YulPaths(ast.variables);
        this.assignment = extractVariant(new YulAssignmentOperator(ast.assignment));
        this.expression = extractVariant(new YulExpression(ast.expression, options));
        this.updateMetadata(this.variables, this.assignment, this.expression);
    }
    print(path, print) {
        return join(' ', [
            path.call(print, 'variables'),
            path.call(print, 'assignment'),
            path.call(print, 'expression')
        ]);
    }
}
//# sourceMappingURL=YulVariableAssignmentStatement.js.map
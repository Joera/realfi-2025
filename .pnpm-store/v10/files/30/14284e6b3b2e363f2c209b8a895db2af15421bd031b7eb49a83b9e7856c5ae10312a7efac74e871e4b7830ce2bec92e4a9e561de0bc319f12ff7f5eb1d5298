import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printLogicalOperation } from '../slang-printers/print-logical-operation.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
export class AndExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.AndExpression;
        this.leftOperand = extractVariant(new Expression(ast.leftOperand, options));
        this.operator = ast.operator.unparse();
        this.rightOperand = extractVariant(new Expression(ast.rightOperand, options));
        this.updateMetadata(this.leftOperand, this.rightOperand);
    }
    print(path, print, options) {
        return printLogicalOperation(this, path, print, options);
    }
}
//# sourceMappingURL=AndExpression.js.map
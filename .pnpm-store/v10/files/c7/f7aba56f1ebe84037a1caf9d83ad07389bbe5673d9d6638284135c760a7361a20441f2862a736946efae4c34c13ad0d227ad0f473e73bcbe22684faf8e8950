import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { isBinaryOperation } from '../slang-utils/is-binary-operation.js';
import { printIndentedGroupOrSpacedDocument } from '../slang-printers/print-indented-group-or-spaced-document.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
import { TerminalNode } from './TerminalNode.js';
export class AssignmentExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.AssignmentExpression;
        this.leftOperand = extractVariant(new Expression(ast.leftOperand, options));
        this.operator = ast.operator.unparse();
        this.rightOperand = extractVariant(new Expression(ast.rightOperand, options));
        this.updateMetadata(this.leftOperand, this.rightOperand);
    }
    print(path, print) {
        return [
            path.call(print, 'leftOperand'),
            ` ${this.operator}`,
            printIndentedGroupOrSpacedDocument(path.call(print, 'rightOperand'), !(this.rightOperand instanceof TerminalNode) &&
                isBinaryOperation(this.rightOperand))
        ];
    }
}
//# sourceMappingURL=AssignmentExpression.js.map
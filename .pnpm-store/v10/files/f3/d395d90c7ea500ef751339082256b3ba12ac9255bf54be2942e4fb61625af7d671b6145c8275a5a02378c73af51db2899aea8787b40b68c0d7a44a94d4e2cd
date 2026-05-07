import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printBinaryOperation } from '../slang-printers/print-binary-operation.js';
import { createHugFunction } from '../slang-utils/create-hug-function.js';
import { createKindCheckFunction } from '../slang-utils/create-kind-check-function.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
const multiplicationTryToHug = createHugFunction(['/', '%']);
const divisionTryToHug = createHugFunction(['*', '%']);
const moduloTryToHug = createHugFunction(['*', '/', '%']);
const printMultiplicativeExpression = printBinaryOperation(createKindCheckFunction([
    NonterminalKind.AdditiveExpression,
    NonterminalKind.ShiftExpression,
    NonterminalKind.BitwiseAndExpression,
    NonterminalKind.BitwiseOrExpression,
    NonterminalKind.BitwiseXorExpression,
    NonterminalKind.InequalityExpression,
    NonterminalKind.EqualityExpression,
    NonterminalKind.AndExpression,
    NonterminalKind.OrExpression
]));
export class MultiplicativeExpression extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.MultiplicativeExpression;
        this.leftOperand = extractVariant(new Expression(ast.leftOperand, options));
        this.operator = ast.operator.unparse();
        this.rightOperand = extractVariant(new Expression(ast.rightOperand, options));
        this.updateMetadata(this.leftOperand, this.rightOperand);
        switch (this.operator) {
            case '*':
                this.leftOperand = multiplicationTryToHug(this.leftOperand);
                break;
            case '/':
                this.leftOperand = divisionTryToHug(this.leftOperand);
                break;
            case '%':
                this.leftOperand = moduloTryToHug(this.leftOperand);
                break;
            default:
                throw new Error(`Unexpected operator: ${this.operator}`);
        }
    }
    print(path, print, options) {
        return printMultiplicativeExpression(this, path, print, options);
    }
}
//# sourceMappingURL=MultiplicativeExpression.js.map
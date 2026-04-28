import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { isBinaryOperation } from '../slang-utils/is-binary-operation.js';
import { TerminalNode } from '../slang-nodes/TerminalNode.js';
const { group, line } = doc.builders;
function rightOperandPrint({ operator, leftOperand }, path, print, options) {
    const rightOperand = path.call(print, 'rightOperand');
    const rightOperandDoc = options.experimentalOperatorPosition === 'end'
        ? [` ${operator}`, line, rightOperand]
        : [line, `${operator} `, rightOperand];
    // If there's only a single binary expression, we want to create a group in
    // order to avoid having a small right part like -1 be on its own line.
    const parent = path.parent;
    const shouldGroup = (leftOperand instanceof TerminalNode || !isBinaryOperation(leftOperand)) &&
        (!isBinaryOperation(parent) ||
            parent.kind === NonterminalKind.AssignmentExpression);
    return shouldGroup ? group(rightOperandDoc) : rightOperandDoc;
}
export const createBinaryOperationPrinter = (groupRulesBuilder, indentRulesBuilder) => (node, path, print, options) => {
    const groupRules = groupRulesBuilder(path);
    const indentRules = indentRulesBuilder(path, options);
    return groupRules([
        path.call(print, 'leftOperand'),
        indentRules(rightOperandPrint(node, path, print, options))
    ]);
};
//# sourceMappingURL=create-binary-operation-printer.js.map
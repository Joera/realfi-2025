import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { createKindCheckFunction } from '../slang-utils/create-kind-check-function.js';
import { isBinaryOperation } from '../slang-utils/is-binary-operation.js';
import { createBinaryOperationPrinter } from './create-binary-operation-printer.js';
const { group, indent } = doc.builders;
export const binaryGroupRulesBuilder = (shouldGroup) => (path) => (document) => {
    const parent = path.parent;
    if (!isBinaryOperation(parent))
        return group(document);
    if (shouldGroup(parent))
        return group(document);
    return document;
};
const isStatementWithoutIndentedOperation = createKindCheckFunction([
    NonterminalKind.ReturnStatement,
    NonterminalKind.IfStatement,
    NonterminalKind.WhileStatement
]);
export const shouldNotIndent = (node, path, index) => isStatementWithoutIndentedOperation(node) ||
    (node.kind === NonterminalKind.ExpressionStatement &&
        path.getNode(index + 1).kind ===
            NonterminalKind.ForStatement);
export const binaryIndentRulesBuilder = (shouldIndent) => (path) => (document) => {
    for (let i = 1, node = path.node;; i++) {
        const parent = path.getNode(i);
        if (shouldNotIndent(parent, path, i))
            break;
        if (!isBinaryOperation(parent))
            return indent(document);
        if (shouldIndent(parent))
            return indent(document);
        if (node === parent.rightOperand)
            break;
        node = parent;
    }
    return document;
};
export const printBinaryOperation = (shouldGroupAndIndent) => createBinaryOperationPrinter(binaryGroupRulesBuilder(shouldGroupAndIndent), binaryIndentRulesBuilder(shouldGroupAndIndent));
//# sourceMappingURL=print-binary-operation.js.map
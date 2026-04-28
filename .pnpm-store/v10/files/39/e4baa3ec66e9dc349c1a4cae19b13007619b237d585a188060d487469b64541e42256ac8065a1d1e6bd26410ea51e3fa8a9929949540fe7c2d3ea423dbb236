import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulBlock } from './YulBlock.js';
import { YulFunctionDefinition } from './YulFunctionDefinition.js';
import { YulVariableDeclarationStatement } from './YulVariableDeclarationStatement.js';
import { YulVariableAssignmentStatement } from './YulVariableAssignmentStatement.js';
import { YulStackAssignmentStatement } from './YulStackAssignmentStatement.js';
import { YulIfStatement } from './YulIfStatement.js';
import { YulForStatement } from './YulForStatement.js';
import { YulSwitchStatement } from './YulSwitchStatement.js';
import { YulLeaveStatement } from './YulLeaveStatement.js';
import { YulBreakStatement } from './YulBreakStatement.js';
import { YulContinueStatement } from './YulContinueStatement.js';
import { YulLabel } from './YulLabel.js';
import { YulExpression } from './YulExpression.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.YulBlock) {
        return new YulBlock(variant, options);
    }
    if (variant instanceof ast.YulFunctionDefinition) {
        return new YulFunctionDefinition(variant, options);
    }
    if (variant instanceof ast.YulVariableDeclarationStatement) {
        return new YulVariableDeclarationStatement(variant, options);
    }
    if (variant instanceof ast.YulVariableAssignmentStatement) {
        return new YulVariableAssignmentStatement(variant, options);
    }
    if (variant instanceof ast.YulStackAssignmentStatement) {
        return new YulStackAssignmentStatement(variant);
    }
    if (variant instanceof ast.YulIfStatement) {
        return new YulIfStatement(variant, options);
    }
    if (variant instanceof ast.YulForStatement) {
        return new YulForStatement(variant, options);
    }
    if (variant instanceof ast.YulSwitchStatement) {
        return new YulSwitchStatement(variant, options);
    }
    if (variant instanceof ast.YulLeaveStatement) {
        return new YulLeaveStatement(variant);
    }
    if (variant instanceof ast.YulBreakStatement) {
        return new YulBreakStatement(variant);
    }
    if (variant instanceof ast.YulContinueStatement) {
        return new YulContinueStatement(variant);
    }
    if (variant instanceof ast.YulLabel) {
        return new YulLabel(variant);
    }
    if (variant instanceof ast.YulExpression) {
        return extractVariant(new YulExpression(variant, options));
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class YulStatement extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulStatement;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=YulStatement.js.map
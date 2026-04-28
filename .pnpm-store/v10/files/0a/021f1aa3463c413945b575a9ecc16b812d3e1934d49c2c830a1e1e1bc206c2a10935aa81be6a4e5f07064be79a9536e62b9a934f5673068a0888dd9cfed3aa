import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ExpressionStatement } from './ExpressionStatement.js';
import { VariableDeclarationStatement } from './VariableDeclarationStatement.js';
import { TupleDeconstructionStatement } from './TupleDeconstructionStatement.js';
import { TerminalNode } from './TerminalNode.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.ExpressionStatement) {
        return new ExpressionStatement(variant, options);
    }
    if (variant instanceof ast.VariableDeclarationStatement) {
        return new VariableDeclarationStatement(variant, options);
    }
    if (variant instanceof ast.TupleDeconstructionStatement) {
        return new TupleDeconstructionStatement(variant, options);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class ForStatementInitialization extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ForStatementInitialization;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = createNonterminalVariant(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ForStatementInitialization.js.map
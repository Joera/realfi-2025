import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ExpressionStatement } from './ExpressionStatement.js';
import { TerminalNode } from './TerminalNode.js';
export class ForStatementCondition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ForStatementCondition;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = new ExpressionStatement(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ForStatementCondition.js.map
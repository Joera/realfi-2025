import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { StringLiteral } from './StringLiteral.js';
import { TerminalNode } from './TerminalNode.js';
export class ExperimentalFeature extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ExperimentalFeature;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = new StringLiteral(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ExperimentalFeature.js.map
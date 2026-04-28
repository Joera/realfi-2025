import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ModifierInvocation } from './ModifierInvocation.js';
import { TerminalNode } from './TerminalNode.js';
export class UnnamedFunctionAttribute extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.UnnamedFunctionAttribute;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = new ModifierInvocation(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=UnnamedFunctionAttribute.js.map
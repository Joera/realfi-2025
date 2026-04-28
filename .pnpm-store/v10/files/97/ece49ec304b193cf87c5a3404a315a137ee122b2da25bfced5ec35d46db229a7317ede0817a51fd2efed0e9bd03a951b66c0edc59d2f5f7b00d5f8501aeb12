import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { OverrideSpecifier } from './OverrideSpecifier.js';
import { TerminalNode } from './TerminalNode.js';
export class StateVariableAttribute extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.StateVariableAttribute;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = new OverrideSpecifier(variant);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=StateVariableAttribute.js.map
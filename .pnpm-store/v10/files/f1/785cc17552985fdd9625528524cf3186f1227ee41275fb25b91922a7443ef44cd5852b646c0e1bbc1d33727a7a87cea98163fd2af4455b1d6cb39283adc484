import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ModifierInvocation } from './ModifierInvocation.js';
import { OverrideSpecifier } from './OverrideSpecifier.js';
import { TerminalNode } from './TerminalNode.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.ModifierInvocation) {
        return new ModifierInvocation(variant, options);
    }
    if (variant instanceof ast.OverrideSpecifier) {
        return new OverrideSpecifier(variant);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class FunctionAttribute extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.FunctionAttribute;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = createNonterminalVariant(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=FunctionAttribute.js.map
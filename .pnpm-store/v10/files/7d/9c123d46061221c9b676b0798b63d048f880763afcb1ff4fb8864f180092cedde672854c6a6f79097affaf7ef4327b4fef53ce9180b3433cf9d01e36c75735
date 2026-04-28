import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
import { TerminalNode } from './TerminalNode.js';
export class UsingTarget extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.UsingTarget;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = extractVariant(new TypeName(variant, options));
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=UsingTarget.js.map
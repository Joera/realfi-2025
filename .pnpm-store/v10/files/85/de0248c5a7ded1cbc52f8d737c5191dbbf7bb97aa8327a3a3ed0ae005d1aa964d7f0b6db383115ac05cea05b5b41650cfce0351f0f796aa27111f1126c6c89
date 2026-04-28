import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { AddressType } from './AddressType.js';
import { TerminalNode } from './TerminalNode.js';
export class ElementaryType extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.ElementaryType;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = new AddressType(variant);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ElementaryType.js.map
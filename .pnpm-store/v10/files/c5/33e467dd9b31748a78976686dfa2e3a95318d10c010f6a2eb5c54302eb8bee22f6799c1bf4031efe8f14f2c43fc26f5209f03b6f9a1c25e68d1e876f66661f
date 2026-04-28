import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { Block } from './Block.js';
import { TerminalNode } from './TerminalNode.js';
export class FunctionBody extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.FunctionBody;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = new Block(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=FunctionBody.js.map
import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind, TerminalNode as SlangTerminalNode } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { HexStringLiteral } from './HexStringLiteral.js';
import { StringLiteral } from './StringLiteral.js';
import { TerminalNode } from './TerminalNode.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.HexStringLiteral) {
        return new HexStringLiteral(variant, options);
    }
    if (variant instanceof ast.StringLiteral) {
        return new StringLiteral(variant, options);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class YulLiteral extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulLiteral;
        const variant = ast.variant;
        if (variant instanceof SlangTerminalNode) {
            this.variant = new TerminalNode(variant);
            return;
        }
        this.variant = createNonterminalVariant(variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=YulLiteral.js.map
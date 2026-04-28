import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { YulDefaultCase } from './YulDefaultCase.js';
import { YulValueCase } from './YulValueCase.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.YulDefaultCase) {
        return new YulDefaultCase(variant, options);
    }
    if (variant instanceof ast.YulValueCase) {
        return new YulValueCase(variant, options);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class YulSwitchCase extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulSwitchCase;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=YulSwitchCase.js.map
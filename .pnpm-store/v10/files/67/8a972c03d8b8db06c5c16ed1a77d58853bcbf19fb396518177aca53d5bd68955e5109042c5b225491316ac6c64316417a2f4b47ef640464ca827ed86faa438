import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TypedTupleMember } from './TypedTupleMember.js';
import { UntypedTupleMember } from './UntypedTupleMember.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.TypedTupleMember) {
        return new TypedTupleMember(variant, options);
    }
    if (variant instanceof ast.UntypedTupleMember) {
        return new UntypedTupleMember(variant);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class TupleMember extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.TupleMember;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=TupleMember.js.map
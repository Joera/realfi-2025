import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { VersionRange } from './VersionRange.js';
import { VersionTerm } from './VersionTerm.js';
function createNonterminalVariant(variant) {
    if (variant instanceof ast.VersionRange) {
        return new VersionRange(variant);
    }
    if (variant instanceof ast.VersionTerm) {
        return new VersionTerm(variant);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class VersionExpression extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.VersionExpression;
        this.variant = createNonterminalVariant(ast.variant);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=VersionExpression.js.map
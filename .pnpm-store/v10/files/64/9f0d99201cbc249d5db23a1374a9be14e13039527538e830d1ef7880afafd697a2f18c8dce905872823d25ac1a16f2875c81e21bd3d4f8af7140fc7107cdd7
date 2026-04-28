import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ElementaryType } from './ElementaryType.js';
import { IdentifierPath } from './IdentifierPath.js';
function createNonterminalVariant(variant) {
    if (variant instanceof ast.ElementaryType) {
        return extractVariant(new ElementaryType(variant));
    }
    if (variant instanceof ast.IdentifierPath) {
        return new IdentifierPath(variant);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class MappingKeyType extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.MappingKeyType;
        this.variant = createNonterminalVariant(ast.variant);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=MappingKeyType.js.map
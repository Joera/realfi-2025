import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { InheritanceSpecifier } from './InheritanceSpecifier.js';
import { StorageLayoutSpecifier } from './StorageLayoutSpecifier.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.InheritanceSpecifier) {
        return new InheritanceSpecifier(variant, options);
    }
    if (variant instanceof ast.StorageLayoutSpecifier) {
        return new StorageLayoutSpecifier(variant, options);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class ContractSpecifier extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ContractSpecifier;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ContractSpecifier.js.map
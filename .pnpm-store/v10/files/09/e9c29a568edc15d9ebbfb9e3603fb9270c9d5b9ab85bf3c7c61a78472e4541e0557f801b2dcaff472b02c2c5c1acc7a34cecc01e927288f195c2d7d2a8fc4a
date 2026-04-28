import * as ast from '@nomicfoundation/slang/ast';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { PositionalArgumentsDeclaration } from './PositionalArgumentsDeclaration.js';
import { NamedArgumentsDeclaration } from './NamedArgumentsDeclaration.js';
function createNonterminalVariant(variant, options) {
    if (variant instanceof ast.PositionalArgumentsDeclaration) {
        return new PositionalArgumentsDeclaration(variant, options);
    }
    if (variant instanceof ast.NamedArgumentsDeclaration) {
        return new NamedArgumentsDeclaration(variant, options);
    }
    const exhaustiveCheck = variant;
    throw new Error(`Unexpected variant: ${JSON.stringify(exhaustiveCheck)}`);
}
export class ArgumentsDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ArgumentsDeclaration;
        this.variant = createNonterminalVariant(ast.variant, options);
        this.updateMetadata(this.variant);
    }
}
//# sourceMappingURL=ArgumentsDeclaration.js.map
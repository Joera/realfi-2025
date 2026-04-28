import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { IdentifierPath } from './IdentifierPath.js';
import { ArgumentsDeclaration } from './ArgumentsDeclaration.js';
export class InheritanceType extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.InheritanceType;
        this.typeName = new IdentifierPath(ast.typeName);
        if (ast.arguments) {
            this.arguments = extractVariant(new ArgumentsDeclaration(ast.arguments, options));
        }
        this.updateMetadata(this.typeName, this.arguments);
    }
    print(path, print) {
        return [path.call(print, 'typeName'), path.call(print, 'arguments')];
    }
}
//# sourceMappingURL=InheritanceType.js.map
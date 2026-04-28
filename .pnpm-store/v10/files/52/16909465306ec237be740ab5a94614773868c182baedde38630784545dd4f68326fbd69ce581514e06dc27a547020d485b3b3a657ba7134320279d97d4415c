import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { joinExisting } from '../slang-utils/join-existing.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { IdentifierPath } from './IdentifierPath.js';
import { ArgumentsDeclaration } from './ArgumentsDeclaration.js';
export class RevertStatement extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.RevertStatement;
        if (ast.error) {
            this.error = new IdentifierPath(ast.error);
        }
        this.arguments = extractVariant(new ArgumentsDeclaration(ast.arguments, options));
        this.updateMetadata(this.error, this.arguments);
    }
    print(path, print) {
        return [
            joinExisting(' ', ['revert', path.call(print, 'error')]),
            path.call(print, 'arguments'),
            ';'
        ];
    }
}
//# sourceMappingURL=RevertStatement.js.map
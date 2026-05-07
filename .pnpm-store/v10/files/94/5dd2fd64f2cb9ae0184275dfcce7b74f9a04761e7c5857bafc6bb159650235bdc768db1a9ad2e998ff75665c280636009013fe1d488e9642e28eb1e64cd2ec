import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { IdentifierPath } from './IdentifierPath.js';
import { ArgumentsDeclaration } from './ArgumentsDeclaration.js';
export class EmitStatement extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.EmitStatement;
        this.event = new IdentifierPath(ast.event);
        this.arguments = extractVariant(new ArgumentsDeclaration(ast.arguments, options));
        this.updateMetadata(this.event, this.arguments);
    }
    print(path, print) {
        return [
            'emit ',
            path.call(print, 'event'),
            path.call(print, 'arguments'),
            ';'
        ];
    }
}
//# sourceMappingURL=EmitStatement.js.map
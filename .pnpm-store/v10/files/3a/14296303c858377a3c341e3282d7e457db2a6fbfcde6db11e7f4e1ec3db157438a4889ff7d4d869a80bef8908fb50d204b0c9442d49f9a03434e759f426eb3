import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { VersionOperator } from './VersionOperator.js';
import { VersionLiteral } from './VersionLiteral.js';
export class VersionTerm extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.VersionTerm;
        if (ast.operator) {
            this.operator = new VersionOperator(ast.operator);
        }
        this.literal = extractVariant(new VersionLiteral(ast.literal));
        this.updateMetadata(this.operator, this.literal);
    }
    print(path, print) {
        return [path.call(print, 'operator'), path.call(print, 'literal')];
    }
}
//# sourceMappingURL=VersionTerm.js.map
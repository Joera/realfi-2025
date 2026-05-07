import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { VersionLiteral } from './VersionLiteral.js';
export class VersionRange extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.VersionRange;
        this.start = extractVariant(new VersionLiteral(ast.start));
        this.end = extractVariant(new VersionLiteral(ast.end));
        this.updateMetadata(this.start, this.end);
    }
    print(path, print) {
        return [path.call(print, 'start'), ' - ', path.call(print, 'end')];
    }
}
//# sourceMappingURL=VersionRange.js.map
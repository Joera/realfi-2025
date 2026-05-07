import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printPreservingEmptyLines } from '../slang-printers/print-preserving-empty-lines.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { SourceUnitMember } from './SourceUnitMember.js';
export class SourceUnitMembers extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.SourceUnitMembers;
        this.items = ast.items.map((item) => extractVariant(new SourceUnitMember(item, options)));
    }
    print(path, print, options) {
        return printPreservingEmptyLines(path, print, options);
    }
}
//# sourceMappingURL=SourceUnitMembers.js.map
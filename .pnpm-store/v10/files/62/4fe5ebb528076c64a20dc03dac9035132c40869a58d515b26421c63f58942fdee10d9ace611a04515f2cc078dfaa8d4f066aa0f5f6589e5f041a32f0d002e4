import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
import { TerminalNode } from './TerminalNode.js';
export class StructMember extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.StructMember;
        this.typeName = extractVariant(new TypeName(ast.typeName, options));
        this.name = new TerminalNode(ast.name);
        this.updateMetadata(this.typeName);
    }
    print(path, print) {
        return [path.call(print, 'typeName'), ' ', path.call(print, 'name'), ';'];
    }
}
//# sourceMappingURL=StructMember.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { ElementaryType } from './ElementaryType.js';
export class UserDefinedValueTypeDefinition extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.UserDefinedValueTypeDefinition;
        this.name = new TerminalNode(ast.name);
        this.valueType = extractVariant(new ElementaryType(ast.valueType));
        this.updateMetadata(this.valueType);
    }
    print(path, print) {
        return [
            'type ',
            path.call(print, 'name'),
            ' is ',
            path.call(print, 'valueType'),
            ';'
        ];
    }
}
//# sourceMappingURL=UserDefinedValueTypeDefinition.js.map
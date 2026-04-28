import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
import { TerminalNode } from './TerminalNode.js';
import { Expression } from './Expression.js';
export class ConstantDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ConstantDefinition;
        this.typeName = extractVariant(new TypeName(ast.typeName, options));
        this.name = new TerminalNode(ast.name);
        this.value = extractVariant(new Expression(ast.value, options));
        this.updateMetadata(this.typeName, this.value);
    }
    print(path, print) {
        return [
            path.call(print, 'typeName'),
            ' constant ',
            path.call(print, 'name'),
            ' = ',
            path.call(print, 'value'),
            ';'
        ];
    }
}
//# sourceMappingURL=ConstantDefinition.js.map
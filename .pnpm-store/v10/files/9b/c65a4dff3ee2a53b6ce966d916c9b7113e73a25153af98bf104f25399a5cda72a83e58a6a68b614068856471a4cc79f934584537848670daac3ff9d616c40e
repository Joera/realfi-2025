import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
import { Expression } from './Expression.js';
export class ArrayTypeName extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ArrayTypeName;
        this.operand = extractVariant(new TypeName(ast.operand, options));
        if (ast.index) {
            this.index = extractVariant(new Expression(ast.index, options));
        }
        this.updateMetadata(this.operand, this.index);
    }
    print(path, print) {
        return [path.call(print, 'operand'), '[', path.call(print, 'index'), ']'];
    }
}
//# sourceMappingURL=ArrayTypeName.js.map
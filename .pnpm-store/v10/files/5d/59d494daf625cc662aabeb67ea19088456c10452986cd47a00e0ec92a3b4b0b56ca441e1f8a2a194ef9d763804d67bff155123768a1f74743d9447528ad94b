import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { sortFunctionAttributes } from '../slang-utils/sort-function-attributes.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { FunctionTypeAttribute } from './FunctionTypeAttribute.js';
const { line } = doc.builders;
export class FunctionTypeAttributes extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.FunctionTypeAttributes;
        this.items = ast.items.map((item) => extractVariant(new FunctionTypeAttribute(item)));
        this.items.sort(sortFunctionAttributes);
    }
    print(path, print) {
        return path.map((item) => [line, print(item)], 'items');
    }
}
//# sourceMappingURL=FunctionTypeAttributes.js.map
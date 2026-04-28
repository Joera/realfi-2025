import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { sortFunctionAttributes } from '../slang-utils/sort-function-attributes.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ConstructorAttribute } from './ConstructorAttribute.js';
const { line } = doc.builders;
export class ConstructorAttributes extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.ConstructorAttributes;
        this.items = ast.items.map((item) => extractVariant(new ConstructorAttribute(item, options)));
        this.items.sort(sortFunctionAttributes);
    }
    print(path, print) {
        return path.map((item) => [line, print(item)], 'items');
    }
}
//# sourceMappingURL=ConstructorAttributes.js.map
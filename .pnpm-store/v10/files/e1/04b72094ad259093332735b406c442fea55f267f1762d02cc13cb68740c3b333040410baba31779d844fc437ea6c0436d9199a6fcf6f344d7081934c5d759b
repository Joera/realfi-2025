import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { sortFunctionAttributes } from '../slang-utils/sort-function-attributes.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { UnnamedFunctionAttribute } from './UnnamedFunctionAttribute.js';
const { line } = doc.builders;
export class UnnamedFunctionAttributes extends SlangNode {
    constructor(ast, options) {
        super(ast, true);
        this.kind = NonterminalKind.UnnamedFunctionAttributes;
        this.items = ast.items.map((item) => extractVariant(new UnnamedFunctionAttribute(item, options)));
        this.items.sort(sortFunctionAttributes);
    }
    print(path, print) {
        return path.map((item) => [line, print(item)], 'items');
    }
}
//# sourceMappingURL=UnnamedFunctionAttributes.js.map
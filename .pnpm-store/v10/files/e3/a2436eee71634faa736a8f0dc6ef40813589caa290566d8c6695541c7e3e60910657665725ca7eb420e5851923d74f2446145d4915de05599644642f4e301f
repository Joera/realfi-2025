import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { sortFunctionAttributes } from '../slang-utils/sort-function-attributes.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ModifierAttribute } from './ModifierAttribute.js';
const { line } = doc.builders;
export class ModifierAttributes extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.ModifierAttributes;
        this.items = ast.items.map((item) => extractVariant(new ModifierAttribute(item)));
        this.items.sort(sortFunctionAttributes);
    }
    print(path, print) {
        return path.map((item) => [line, print(item)], 'items');
    }
}
//# sourceMappingURL=ModifierAttributes.js.map
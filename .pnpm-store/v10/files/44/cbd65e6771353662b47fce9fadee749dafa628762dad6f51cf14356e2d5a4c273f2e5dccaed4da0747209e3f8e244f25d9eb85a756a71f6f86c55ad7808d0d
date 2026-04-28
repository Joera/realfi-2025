import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { sortFunctionAttributes } from '../slang-utils/sort-function-attributes.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { StateVariableAttribute } from './StateVariableAttribute.js';
const { line } = doc.builders;
export class StateVariableAttributes extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.StateVariableAttributes;
        this.items = ast.items.map((item) => extractVariant(new StateVariableAttribute(item)));
        this.items.sort(sortFunctionAttributes);
    }
    print(path, print) {
        return path.map((item) => [line, print(item)], 'items');
    }
}
//# sourceMappingURL=StateVariableAttributes.js.map
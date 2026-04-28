import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printGroupAndIndentIfBreakPair } from '../slang-printers/print-group-and-indent-if-break-pair.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
import { StateVariableAttributes } from './StateVariableAttributes.js';
import { TerminalNode } from './TerminalNode.js';
import { StateVariableDefinitionValue } from './StateVariableDefinitionValue.js';
const { indent } = doc.builders;
export class StateVariableDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.StateVariableDefinition;
        this.typeName = extractVariant(new TypeName(ast.typeName, options));
        this.attributes = new StateVariableAttributes(ast.attributes);
        this.name = new TerminalNode(ast.name);
        if (ast.value) {
            this.value = new StateVariableDefinitionValue(ast.value, options);
        }
        this.updateMetadata(this.typeName, this.attributes, this.value);
    }
    print(path, print) {
        return printGroupAndIndentIfBreakPair([
            path.call(print, 'typeName'),
            indent(path.call(print, 'attributes')),
            ' ',
            path.call(print, 'name')
        ], [path.call(print, 'value'), ';']);
    }
}
//# sourceMappingURL=StateVariableDefinition.js.map
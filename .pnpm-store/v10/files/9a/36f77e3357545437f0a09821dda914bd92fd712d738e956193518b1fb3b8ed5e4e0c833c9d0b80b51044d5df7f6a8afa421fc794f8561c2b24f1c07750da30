import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printIndentedGroupOrSpacedDocument } from '../slang-printers/print-indented-group-or-spaced-document.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
export class StateVariableDefinitionValue extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.StateVariableDefinitionValue;
        this.value = extractVariant(new Expression(ast.value, options));
        this.updateMetadata(this.value);
    }
    print(path, print) {
        return [
            ' =',
            printIndentedGroupOrSpacedDocument(path.call(print, 'value'), this.value.kind !== NonterminalKind.ArrayExpression)
        ];
    }
}
//# sourceMappingURL=StateVariableDefinitionValue.js.map
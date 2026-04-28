import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printFunctionWithBody } from '../slang-printers/print-function.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
import { ReceiveFunctionAttributes } from './ReceiveFunctionAttributes.js';
import { FunctionBody } from './FunctionBody.js';
export class ReceiveFunctionDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ReceiveFunctionDefinition;
        this.parameters = new ParametersDeclaration(ast.parameters, options);
        this.attributes = new ReceiveFunctionAttributes(ast.attributes, options);
        this.body = extractVariant(new FunctionBody(ast.body, options));
        this.updateMetadata(this.parameters, this.attributes, this.body);
        this.cleanModifierInvocationArguments();
    }
    cleanModifierInvocationArguments() {
        for (const attribute of this.attributes.items) {
            if (typeof attribute !== 'string' &&
                attribute.kind === NonterminalKind.ModifierInvocation) {
                attribute.cleanModifierInvocationArguments();
            }
        }
    }
    print(path, print) {
        return printFunctionWithBody('receive', this, path, print);
    }
}
//# sourceMappingURL=ReceiveFunctionDefinition.js.map
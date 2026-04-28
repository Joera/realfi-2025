import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printFunctionWithBody } from '../slang-printers/print-function.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
import { FallbackFunctionAttributes } from './FallbackFunctionAttributes.js';
import { ReturnsDeclaration } from './ReturnsDeclaration.js';
import { FunctionBody } from './FunctionBody.js';
export class FallbackFunctionDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.FallbackFunctionDefinition;
        this.parameters = new ParametersDeclaration(ast.parameters, options);
        this.attributes = new FallbackFunctionAttributes(ast.attributes, options);
        if (ast.returns) {
            this.returns = new ReturnsDeclaration(ast.returns, options);
        }
        this.body = extractVariant(new FunctionBody(ast.body, options));
        this.updateMetadata(this.parameters, this.attributes, this.returns, this.body);
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
        return printFunctionWithBody('fallback', this, path, print);
    }
}
//# sourceMappingURL=FallbackFunctionDefinition.js.map
import { satisfies } from 'semver';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printFunctionWithBody } from '../slang-printers/print-function.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { FunctionName } from './FunctionName.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
import { FunctionAttributes } from './FunctionAttributes.js';
import { ReturnsDeclaration } from './ReturnsDeclaration.js';
import { FunctionBody } from './FunctionBody.js';
export class FunctionDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.FunctionDefinition;
        this.name = extractVariant(new FunctionName(ast.name));
        this.parameters = new ParametersDeclaration(ast.parameters, options);
        this.attributes = new FunctionAttributes(ast.attributes, options);
        if (ast.returns) {
            this.returns = new ReturnsDeclaration(ast.returns, options);
        }
        this.body = extractVariant(new FunctionBody(ast.body, options));
        this.updateMetadata(this.name, this.parameters, this.attributes, this.returns, this.body);
        // Older versions of Solidity defined a constructor as a function having
        // the same name as the contract.
        if (satisfies(options.compiler, '>=0.5.0')) {
            this.cleanModifierInvocationArguments();
        }
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
        return printFunctionWithBody(['function ', path.call(print, 'name')], this, path, print);
    }
}
//# sourceMappingURL=FunctionDefinition.js.map
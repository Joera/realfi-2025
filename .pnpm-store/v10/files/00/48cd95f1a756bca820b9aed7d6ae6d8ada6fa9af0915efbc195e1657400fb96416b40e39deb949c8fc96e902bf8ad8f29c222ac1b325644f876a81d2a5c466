import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printFunction } from '../slang-printers/print-function.js';
import { SlangNode } from './SlangNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
import { FunctionTypeAttributes } from './FunctionTypeAttributes.js';
import { ReturnsDeclaration } from './ReturnsDeclaration.js';
export class FunctionType extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.FunctionType;
        this.parameters = new ParametersDeclaration(ast.parameters, options);
        this.attributes = new FunctionTypeAttributes(ast.attributes);
        if (ast.returns) {
            this.returns = new ReturnsDeclaration(ast.returns, options);
        }
        this.updateMetadata(this.parameters, this.attributes, this.returns);
    }
    print(path, print) {
        return printFunction('function', this, path, print);
    }
}
//# sourceMappingURL=FunctionType.js.map
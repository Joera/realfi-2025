import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { ErrorParameters } from './ErrorParameters.js';
export class ErrorParametersDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ErrorParametersDeclaration;
        this.parameters = new ErrorParameters(ast.parameters, options);
        this.updateMetadata(this.parameters);
    }
    print(path, print) {
        return ['(', path.call(print, 'parameters'), ')'];
    }
}
//# sourceMappingURL=ErrorParametersDeclaration.js.map
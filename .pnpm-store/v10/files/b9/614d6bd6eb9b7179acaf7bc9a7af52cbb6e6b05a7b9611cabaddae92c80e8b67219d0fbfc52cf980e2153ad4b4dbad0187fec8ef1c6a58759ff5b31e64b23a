import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { Parameters } from './Parameters.js';
export class ParametersDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ParametersDeclaration;
        this.parameters = new Parameters(ast.parameters, options);
        this.updateMetadata(this.parameters);
    }
    print(path, print) {
        return ['(', path.call(print, 'parameters'), ')'];
    }
}
//# sourceMappingURL=ParametersDeclaration.js.map
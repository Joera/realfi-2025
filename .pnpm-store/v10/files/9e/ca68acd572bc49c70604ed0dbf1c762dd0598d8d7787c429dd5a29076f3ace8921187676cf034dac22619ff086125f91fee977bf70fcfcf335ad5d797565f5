import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { YulParameters } from './YulParameters.js';
export class YulParametersDeclaration extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.YulParametersDeclaration;
        this.parameters = new YulParameters(ast.parameters);
        this.updateMetadata(this.parameters);
    }
    print(path, print) {
        return ['(', path.call(print, 'parameters'), ')'];
    }
}
//# sourceMappingURL=YulParametersDeclaration.js.map
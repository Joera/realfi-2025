import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
const { group } = doc.builders;
export class ReturnsDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ReturnsDeclaration;
        this.variables = new ParametersDeclaration(ast.variables, options);
        this.updateMetadata(this.variables);
    }
    print(path, print) {
        return ['returns ', group(path.call(print, 'variables'))];
    }
}
//# sourceMappingURL=ReturnsDeclaration.js.map
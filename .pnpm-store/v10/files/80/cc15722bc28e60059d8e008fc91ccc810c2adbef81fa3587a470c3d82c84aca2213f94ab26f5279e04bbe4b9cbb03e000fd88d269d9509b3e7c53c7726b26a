import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { EventParameters } from './EventParameters.js';
export class EventParametersDeclaration extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.EventParametersDeclaration;
        this.parameters = new EventParameters(ast.parameters, options);
        this.updateMetadata(this.parameters);
    }
    print(path, print) {
        return ['(', path.call(print, 'parameters'), ')'];
    }
}
//# sourceMappingURL=EventParametersDeclaration.js.map
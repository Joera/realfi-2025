import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
const { group } = doc.builders;
export class CatchClauseError extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.CatchClauseError;
        if (ast.name) {
            this.name = new TerminalNode(ast.name);
        }
        this.parameters = new ParametersDeclaration(ast.parameters, options);
        this.updateMetadata(this.parameters);
    }
    print(path, print) {
        return [
            path.call(print, 'name'),
            group(path.call(print, 'parameters')),
            ' '
        ];
    }
}
//# sourceMappingURL=CatchClauseError.js.map
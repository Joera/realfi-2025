import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { YulParametersDeclaration } from './YulParametersDeclaration.js';
import { YulReturnsDeclaration } from './YulReturnsDeclaration.js';
import { YulBlock } from './YulBlock.js';
export class YulFunctionDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulFunctionDefinition;
        this.name = new TerminalNode(ast.name);
        this.parameters = new YulParametersDeclaration(ast.parameters);
        if (ast.returns) {
            this.returns = new YulReturnsDeclaration(ast.returns);
        }
        this.body = new YulBlock(ast.body, options);
        this.updateMetadata(this.parameters, this.returns, this.body);
    }
    print(path, print) {
        return [
            'function ',
            path.call(print, 'name'),
            path.call(print, 'parameters'),
            path.call(print, 'returns') || ' ',
            path.call(print, 'body')
        ];
    }
}
//# sourceMappingURL=YulFunctionDefinition.js.map
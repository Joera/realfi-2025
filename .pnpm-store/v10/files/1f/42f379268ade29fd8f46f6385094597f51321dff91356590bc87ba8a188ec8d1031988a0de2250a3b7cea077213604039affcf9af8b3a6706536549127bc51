import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { Expression } from './Expression.js';
export class NamedArgument extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.NamedArgument;
        this.name = new TerminalNode(ast.name);
        this.value = extractVariant(new Expression(ast.value, options));
        this.updateMetadata(this.value);
    }
    print(path, print) {
        return [path.call(print, 'name'), ': ', path.call(print, 'value')];
    }
}
//# sourceMappingURL=NamedArgument.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { NamedArguments } from './NamedArguments.js';
export class NamedArgumentGroup extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.NamedArgumentGroup;
        this.arguments = new NamedArguments(ast.arguments, options);
        this.updateMetadata(this.arguments);
    }
    print(path, print) {
        return ['{', path.call(print, 'arguments'), '}'];
    }
}
//# sourceMappingURL=NamedArgumentGroup.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { YulBlock } from './YulBlock.js';
export class YulDefaultCase extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulDefaultCase;
        this.body = new YulBlock(ast.body, options);
        this.updateMetadata(this.body);
    }
    print(path, print) {
        return ['default ', path.call(print, 'body')];
    }
}
//# sourceMappingURL=YulDefaultCase.js.map
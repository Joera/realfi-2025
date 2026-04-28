import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { YulPath } from './YulPath.js';
const { join } = doc.builders;
export class YulPaths extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.YulPaths;
        this.items = ast.items.map((item) => new YulPath(item));
    }
    print(path, print) {
        return join(', ', path.map(print, 'items'));
    }
}
//# sourceMappingURL=YulPaths.js.map
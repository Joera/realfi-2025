import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { Block } from './Block.js';
export class UncheckedBlock extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.UncheckedBlock;
        this.block = new Block(ast.block, options);
        this.updateMetadata(this.block);
    }
    print(path, print) {
        return ['unchecked ', path.call(print, 'block')];
    }
}
//# sourceMappingURL=UncheckedBlock.js.map
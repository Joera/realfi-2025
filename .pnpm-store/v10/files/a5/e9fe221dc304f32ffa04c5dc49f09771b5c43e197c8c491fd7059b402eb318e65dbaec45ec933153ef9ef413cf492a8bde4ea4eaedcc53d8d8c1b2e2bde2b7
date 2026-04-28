import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { YulLiteral } from './YulLiteral.js';
import { YulBlock } from './YulBlock.js';
export class YulValueCase extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.YulValueCase;
        this.value = extractVariant(new YulLiteral(ast.value, options));
        this.body = new YulBlock(ast.body, options);
        this.updateMetadata(this.value, this.body);
    }
    print(path, print) {
        return ['case ', path.call(print, 'value'), ' ', path.call(print, 'body')];
    }
}
//# sourceMappingURL=YulValueCase.js.map
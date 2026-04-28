import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
export class AbicoderVersion extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.AbicoderVersion;
        this.variant = ast.variant.unparse();
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=AbicoderVersion.js.map
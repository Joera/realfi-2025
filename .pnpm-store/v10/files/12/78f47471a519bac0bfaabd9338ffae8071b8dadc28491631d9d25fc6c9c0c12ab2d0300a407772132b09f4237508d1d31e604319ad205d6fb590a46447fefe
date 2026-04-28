import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
export class StorageLocation extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.StorageLocation;
        this.variant = ast.variant.unparse();
    }
    print() {
        return this.variant;
    }
}
//# sourceMappingURL=StorageLocation.js.map
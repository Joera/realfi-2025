import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { AbicoderVersion } from './AbicoderVersion.js';
export class AbicoderPragma extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.AbicoderPragma;
        this.version = new AbicoderVersion(ast.version);
    }
    print(path, print) {
        return ['abicoder ', path.call(print, 'version')];
    }
}
//# sourceMappingURL=AbicoderPragma.js.map
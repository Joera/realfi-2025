import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { ExperimentalFeature } from './ExperimentalFeature.js';
export class ExperimentalPragma extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ExperimentalPragma;
        this.feature = extractVariant(new ExperimentalFeature(ast.feature, options));
        this.updateMetadata(this.feature);
    }
    print(path, print) {
        return ['experimental ', path.call(print, 'feature')];
    }
}
//# sourceMappingURL=ExperimentalPragma.js.map
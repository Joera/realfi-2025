import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Pragma } from './Pragma.js';
export class PragmaDirective extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.PragmaDirective;
        this.pragma = extractVariant(new Pragma(ast.pragma, options));
        this.updateMetadata(this.pragma);
    }
    print(path, print) {
        return ['pragma ', path.call(print, 'pragma'), ';'];
    }
}
//# sourceMappingURL=PragmaDirective.js.map
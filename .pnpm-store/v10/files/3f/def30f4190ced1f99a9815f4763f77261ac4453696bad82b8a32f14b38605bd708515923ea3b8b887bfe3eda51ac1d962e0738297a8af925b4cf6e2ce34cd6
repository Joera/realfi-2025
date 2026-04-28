import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printSeparatedItem } from '../slang-printers/print-separated-item.js';
import { SlangNode } from './SlangNode.js';
import { YulVariableNames } from './YulVariableNames.js';
const { line } = doc.builders;
export class YulReturnsDeclaration extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.YulReturnsDeclaration;
        this.variables = new YulVariableNames(ast.variables);
        this.updateMetadata(this.variables);
    }
    print(path, print) {
        return printSeparatedItem(['->', path.call(print, 'variables')], {
            firstSeparator: line
        });
    }
}
//# sourceMappingURL=YulReturnsDeclaration.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printSeparatedList } from '../slang-printers/print-separated-list.js';
import { SlangNode } from './SlangNode.js';
import { UsingDeconstructionSymbol } from './UsingDeconstructionSymbol.js';
const { line, softline } = doc.builders;
export class UsingDeconstructionSymbols extends SlangNode {
    constructor(ast) {
        super(ast, true);
        this.kind = NonterminalKind.UsingDeconstructionSymbols;
        this.items = ast.items.map((item) => new UsingDeconstructionSymbol(item));
    }
    print(path, print, options) {
        return printSeparatedList(path.map(print, 'items'), {
            firstSeparator: options.bracketSpacing ? line : softline
        });
    }
}
//# sourceMappingURL=UsingDeconstructionSymbols.js.map
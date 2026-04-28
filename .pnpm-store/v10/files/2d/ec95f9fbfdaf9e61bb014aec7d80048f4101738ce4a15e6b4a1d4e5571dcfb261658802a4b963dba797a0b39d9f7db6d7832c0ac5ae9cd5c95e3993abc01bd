import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printSeparatedItem } from '../slang-printers/print-separated-item.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
const { line } = doc.builders;
export class StorageLayoutSpecifier extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.StorageLayoutSpecifier;
        this.expression = extractVariant(new Expression(ast.expression, options));
        this.updateMetadata(this.expression);
    }
    print(path, print) {
        return [
            'layout at',
            printSeparatedItem(path.call(print, 'expression'), {
                firstSeparator: line,
                // If this is the second ContractSpecifier we have to delegate printing
                // the line to the ContractSpecifiers node.
                lastSeparator: path.isFirst ? line : ''
            })
        ];
    }
}
//# sourceMappingURL=StorageLayoutSpecifier.js.map
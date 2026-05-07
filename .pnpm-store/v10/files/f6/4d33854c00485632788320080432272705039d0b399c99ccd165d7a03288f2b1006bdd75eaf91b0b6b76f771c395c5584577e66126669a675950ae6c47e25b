import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { printSeparatedItem } from '../slang-printers/print-separated-item.js';
import { joinExisting } from '../slang-utils/join-existing.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { Expression } from './Expression.js';
import { ReturnsDeclaration } from './ReturnsDeclaration.js';
import { Block } from './Block.js';
import { CatchClauses } from './CatchClauses.js';
const { line } = doc.builders;
export class TryStatement extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.TryStatement;
        this.expression = extractVariant(new Expression(ast.expression, options));
        if (ast.returns) {
            this.returns = new ReturnsDeclaration(ast.returns, options);
        }
        this.body = new Block(ast.body, options);
        this.catchClauses = new CatchClauses(ast.catchClauses, options);
        this.updateMetadata(this.expression, this.returns, this.body, this.catchClauses);
    }
    print(path, print) {
        return [
            'try',
            printSeparatedItem(path.call(print, 'expression'), {
                firstSeparator: line
            }),
            joinExisting(' ', [
                path.call(print, 'returns'),
                path.call(print, 'body'),
                path.call(print, 'catchClauses')
            ])
        ];
    }
}
//# sourceMappingURL=TryStatement.js.map
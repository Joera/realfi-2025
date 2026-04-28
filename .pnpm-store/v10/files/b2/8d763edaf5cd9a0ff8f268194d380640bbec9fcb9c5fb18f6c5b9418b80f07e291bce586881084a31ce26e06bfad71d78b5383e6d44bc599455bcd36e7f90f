import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { doc } from 'prettier';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
const { dedent, line } = doc.builders;
export class YulLabel extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = NonterminalKind.YulLabel;
        this.label = new TerminalNode(ast.label);
    }
    print(path, print) {
        return [dedent(line), path.call(print, 'label'), ':'];
    }
}
//# sourceMappingURL=YulLabel.js.map
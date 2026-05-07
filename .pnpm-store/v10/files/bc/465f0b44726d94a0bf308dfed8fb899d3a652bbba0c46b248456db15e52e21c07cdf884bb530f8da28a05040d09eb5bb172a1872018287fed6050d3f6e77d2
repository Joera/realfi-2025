import { SlangNode } from './SlangNode.js';
export class TerminalNode extends SlangNode {
    constructor(ast) {
        super(ast);
        this.kind = ast.kind;
        this.value = ast.unparse();
    }
    print() {
        return this.value;
    }
}
//# sourceMappingURL=TerminalNode.js.map
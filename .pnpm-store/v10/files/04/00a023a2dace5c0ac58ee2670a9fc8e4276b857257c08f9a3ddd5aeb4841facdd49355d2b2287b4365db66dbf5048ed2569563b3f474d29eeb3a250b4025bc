import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printFunctionWithBody } from '../slang-printers/print-function.js';
import { SlangNode } from './SlangNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
import { ConstructorAttributes } from './ConstructorAttributes.js';
import { Block } from './Block.js';
export class ConstructorDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ConstructorDefinition;
        this.parameters = new ParametersDeclaration(ast.parameters, options);
        this.attributes = new ConstructorAttributes(ast.attributes, options);
        this.body = new Block(ast.body, options);
        this.updateMetadata(this.parameters, this.attributes, this.body);
    }
    print(path, print) {
        return printFunctionWithBody('constructor', this, path, print);
    }
}
//# sourceMappingURL=ConstructorDefinition.js.map
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { printFunctionWithBody } from '../slang-printers/print-function.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { ParametersDeclaration } from './ParametersDeclaration.js';
import { Parameters } from './Parameters.js';
import { ModifierAttributes } from './ModifierAttributes.js';
import { FunctionBody } from './FunctionBody.js';
export class ModifierDefinition extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.ModifierDefinition;
        this.name = new TerminalNode(ast.name);
        if (ast.parameters) {
            this.parameters = new ParametersDeclaration(ast.parameters, options);
        }
        this.attributes = new ModifierAttributes(ast.attributes);
        this.body = extractVariant(new FunctionBody(ast.body, options));
        this.updateMetadata(this.parameters, this.attributes, this.body);
        if (!this.parameters) {
            const attributesLoc = this.attributes.loc;
            const parametersOffset = attributesLoc.start - attributesLoc.leadingOffset;
            const parametersLoc = {
                start: parametersOffset,
                end: parametersOffset,
                leadingOffset: 0,
                trailingOffset: 0
            };
            this.parameters = Object.assign(Object.create(ParametersDeclaration.prototype), {
                kind: NonterminalKind.ParametersDeclaration,
                loc: Object.assign({}, parametersLoc),
                comments: [],
                parameters: Object.assign(Object.create(Parameters.prototype), {
                    kind: NonterminalKind.Parameters,
                    loc: Object.assign({}, parametersLoc),
                    comments: [],
                    items: []
                })
            });
        }
    }
    print(path, print) {
        return printFunctionWithBody(['modifier ', path.call(print, 'name')], this, path, print);
    }
}
//# sourceMappingURL=ModifierDefinition.js.map
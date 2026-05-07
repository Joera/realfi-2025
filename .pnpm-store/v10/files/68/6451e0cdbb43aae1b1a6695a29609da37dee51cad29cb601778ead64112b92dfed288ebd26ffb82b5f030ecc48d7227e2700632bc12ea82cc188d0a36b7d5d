import { doc } from 'prettier';
import { satisfies } from 'semver';
import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { TerminalNode } from './TerminalNode.js';
import { ContractSpecifiers } from './ContractSpecifiers.js';
import { ContractMembers } from './ContractMembers.js';
const { group, line } = doc.builders;
export class ContractDefinition extends SlangNode {
    constructor(ast, options) {
        var _a;
        super(ast);
        this.kind = NonterminalKind.ContractDefinition;
        this.abstractKeyword = (_a = ast.abstractKeyword) === null || _a === void 0 ? void 0 : _a.unparse();
        this.name = new TerminalNode(ast.name);
        this.specifiers = new ContractSpecifiers(ast.specifiers, options);
        this.members = new ContractMembers(ast.members, options);
        this.updateMetadata(this.specifiers, this.members);
        this.cleanModifierInvocationArguments(options);
    }
    cleanModifierInvocationArguments(options) {
        // Older versions of Solidity defined a constructor as a function having
        // the same name as the contract.
        if (!satisfies(options.compiler, '>=0.5.0')) {
            for (const member of this.members.items) {
                if (member.kind === NonterminalKind.FunctionDefinition &&
                    member.name.value !== this.name.value) {
                    member.cleanModifierInvocationArguments();
                }
            }
        }
    }
    print(path, print) {
        return [
            group([
                this.abstractKeyword ? 'abstract ' : '',
                'contract ',
                path.call(print, 'name'),
                path.call(print, 'specifiers'),
                this.specifiers.items.length > 0 ? '' : line,
                '{'
            ]),
            path.call(print, 'members'),
            '}'
        ];
    }
}
//# sourceMappingURL=ContractDefinition.js.map
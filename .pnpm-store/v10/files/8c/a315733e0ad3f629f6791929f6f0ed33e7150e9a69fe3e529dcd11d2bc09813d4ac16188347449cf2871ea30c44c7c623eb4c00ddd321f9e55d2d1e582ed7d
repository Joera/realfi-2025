import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { joinExisting } from '../slang-utils/join-existing.js';
import { extractVariant } from '../slang-utils/extract-variant.js';
import { SlangNode } from './SlangNode.js';
import { TypeName } from './TypeName.js';
import { StorageLocation } from './StorageLocation.js';
import { TerminalNode } from './TerminalNode.js';
export class TypedTupleMember extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.TypedTupleMember;
        this.typeName = extractVariant(new TypeName(ast.typeName, options));
        if (ast.storageLocation) {
            this.storageLocation = new StorageLocation(ast.storageLocation);
        }
        this.name = new TerminalNode(ast.name);
        this.updateMetadata(this.typeName, this.storageLocation);
    }
    print(path, print) {
        return joinExisting(' ', [
            path.call(print, 'typeName'),
            path.call(print, 'storageLocation'),
            path.call(print, 'name')
        ]);
    }
}
//# sourceMappingURL=TypedTupleMember.js.map
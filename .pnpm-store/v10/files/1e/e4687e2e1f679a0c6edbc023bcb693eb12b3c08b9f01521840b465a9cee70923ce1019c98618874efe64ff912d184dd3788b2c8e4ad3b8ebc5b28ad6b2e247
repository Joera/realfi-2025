import { NonterminalKind } from '@nomicfoundation/slang/cst';
import { SlangNode } from './SlangNode.js';
import { MappingKey } from './MappingKey.js';
import { MappingValue } from './MappingValue.js';
export class MappingType extends SlangNode {
    constructor(ast, options) {
        super(ast);
        this.kind = NonterminalKind.MappingType;
        this.keyType = new MappingKey(ast.keyType);
        this.valueType = new MappingValue(ast.valueType, options);
        this.updateMetadata(this.keyType, this.valueType);
    }
    print(path, print) {
        return [
            'mapping(',
            path.call(print, 'keyType'),
            ' => ',
            path.call(print, 'valueType'),
            ')'
        ];
    }
}
//# sourceMappingURL=MappingType.js.map
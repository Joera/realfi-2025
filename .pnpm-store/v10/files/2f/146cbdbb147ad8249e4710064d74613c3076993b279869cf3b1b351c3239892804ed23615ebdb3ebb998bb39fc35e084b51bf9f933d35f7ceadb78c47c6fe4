import { describe, it, expect } from 'vitest';
import { mergeABIs, mergeArtifacts } from './artifacts.js';
describe('Artifact Utilities', () => {
    describe('mergeABIs', () => {
        describe('basic merging', () => {
            it('should merge two simple ABIs', () => {
                const abi1 = [
                    {
                        type: 'function',
                        name: 'foo',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const abi2 = [
                    {
                        type: 'function',
                        name: 'bar',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const result = mergeABIs([
                    { name: 'Contract1', abi: abi1 },
                    { name: 'Contract2', abi: abi2 },
                ]);
                expect(result.mergedABI).toHaveLength(2);
                expect(result.mergedABI[0].name).toBe('foo');
                expect(result.mergedABI[1].name).toBe('bar');
            });
            it('should handle ABI with no functions', () => {
                const abi1 = [
                    {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [],
                    },
                    {
                        type: 'event',
                        name: 'Approval',
                        inputs: [],
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi1 }]);
                // Both events should be included since they have different names
                expect(result.mergedABI).toHaveLength(2);
                expect(result.mergedABI[0].type).toBe('event');
                expect(result.mergedABI[0].name).toBe('Transfer');
                expect(result.mergedABI[1].type).toBe('event');
                expect(result.mergedABI[1].name).toBe('Approval');
            });
            it('should handle empty ABI', () => {
                const result = mergeABIs([{ name: 'Contract1', abi: [] }]);
                expect(result.mergedABI).toHaveLength(0);
            });
            it('should handle errors', () => {
                const abi = [
                    {
                        type: 'error',
                        name: 'InsufficientBalance',
                        inputs: [],
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi }]);
                expect(result.mergedABI).toHaveLength(1);
                expect(result.mergedABI[0].type).toBe('error');
                expect(result.mergedABI[0].name).toBe('InsufficientBalance');
            });
            it('should skip constructors', () => {
                const abi = [
                    {
                        type: 'constructor',
                        inputs: [],
                    },
                    {
                        type: 'function',
                        name: 'foo',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi }]);
                expect(result.mergedABI).toHaveLength(1);
                expect(result.mergedABI[0].type).toBe('function');
            });
            it('should skip fallback and receive functions', () => {
                const abi = [
                    {
                        type: 'fallback',
                        stateMutability: 'nonpayable',
                    },
                    {
                        type: 'receive',
                        stateMutability: 'payable',
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi }]);
                expect(result.mergedABI).toHaveLength(0);
            });
        });
        describe('duplicate handling', () => {
            it('should deduplicate functions with same name but different signatures (first one wins)', () => {
                const abi1 = [
                    {
                        type: 'function',
                        name: 'foo',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const abi2 = [
                    {
                        type: 'function',
                        name: 'foo',
                        inputs: [{ type: 'uint256' }],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const result = mergeABIs([
                    { name: 'Contract1', abi: abi1 },
                    { name: 'Contract2', abi: abi2 },
                ]);
                // Only one should be included since they have the same name
                expect(result.mergedABI).toHaveLength(1);
                expect(result.mergedABI[0].name).toBe('foo');
            });
            it('should include both functions when they have different names but same input types', () => {
                const abi1 = [
                    {
                        type: 'function',
                        name: 'transfer',
                        inputs: [{ type: 'address' }, { type: 'uint256' }],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const abi2 = [
                    {
                        type: 'function',
                        name: 'transferTokens',
                        inputs: [{ type: 'address' }, { type: 'uint256' }],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const result = mergeABIs([
                    { name: 'Contract1', abi: abi1 },
                    { name: 'Contract2', abi: abi2 },
                ], { doNotCheckForConflicts: true });
                // Both functions should be included since they have different names
                expect(result.mergedABI).toHaveLength(2);
                expect(result.mergedABI[0].name).toBe('transfer');
                // Both functions should be included since they have different names (different selectors)
                expect(result.mergedABI).toHaveLength(2);
                expect(result.mergedABI[0].name).toBe('transfer');
                expect(result.mergedABI[1].name).toBe('transferTokens');
            });
            it('should deduplicate events with same name', () => {
                const abi1 = [
                    {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [],
                    },
                ];
                const abi2 = [
                    {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [],
                    },
                ];
                const result = mergeABIs([
                    { name: 'Contract1', abi: abi1 },
                    { name: 'Contract2', abi: abi2 },
                ]);
                expect(result.mergedABI).toHaveLength(1);
                expect(result.mergedABI[0].name).toBe('Transfer');
            });
            it('should deduplicate errors with same name', () => {
                const abi1 = [
                    {
                        type: 'error',
                        name: 'InsufficientBalance',
                        inputs: [],
                    },
                ];
                const abi2 = [
                    {
                        type: 'error',
                        name: 'InsufficientBalance',
                        inputs: [],
                    },
                ];
                const result = mergeABIs([
                    { name: 'Contract1', abi: abi1 },
                    { name: 'Contract2', abi: abi2 },
                ]);
                expect(result.mergedABI).toHaveLength(1);
                expect(result.mergedABI[0].name).toBe('InsufficientBalance');
            });
        });
        describe('return values', () => {
            it('should return added map', () => {
                const abi = [
                    {
                        type: 'function',
                        name: 'foo',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi }]);
                expect(result.added.has('foo')).toBe(true);
                expect(result.added.get('foo')).toEqual(abi[0]);
            });
            it('should return sigJSMap', () => {
                const abi = [
                    {
                        type: 'function',
                        name: 'foo',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi }]);
                expect(result.sigJSMap.size).toBe(1);
                const selector = Array.from(result.sigJSMap.keys())[0];
                const value = result.sigJSMap.get(selector);
                expect(value.routeName).toBe('Contract1');
                expect(value.functionName).toBe('foo');
            });
        });
        describe('mixed ABI types', () => {
            it('should handle mixed ABI with functions, events, and errors', () => {
                const abi = [
                    {
                        type: 'function',
                        name: 'transfer',
                        inputs: [],
                        outputs: [],
                        stateMutability: 'nonpayable',
                    },
                    {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [],
                    },
                    {
                        type: 'error',
                        name: 'InsufficientBalance',
                        inputs: [],
                    },
                ];
                const result = mergeABIs([{ name: 'Contract1', abi: abi }]);
                expect(result.mergedABI).toHaveLength(3);
                expect(result.mergedABI[0].type).toBe('function');
                expect(result.mergedABI[1].type).toBe('event');
                expect(result.mergedABI[2].type).toBe('error');
            });
        });
    });
    describe('mergeArtifacts', () => {
        describe('basic merging', () => {
            it('should merge two artifacts', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                };
                const artifact2 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'bar',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x5678',
                };
                const result = mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ]);
                expect(result.mergedABI).toHaveLength(2);
                expect(result.mergedABI[0].name).toBe('foo');
                expect(result.mergedABI[1].name).toBe('bar');
            });
            it('should merge artifacts with empty documentation', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                };
                const result = mergeArtifacts([{ name: 'Contract1', artifact: artifact1 }]);
                expect(result.mergedABI).toHaveLength(1);
                expect(result.mergedDevDocs).toBeDefined();
                expect(result.mergedUserDocs).toBeDefined();
                expect(result.mergedDevDocs.kind).toBe('dev');
                expect(result.mergedDevDocs.version).toBe(1);
                expect(result.mergedUserDocs.kind).toBe('user');
                expect(result.mergedUserDocs.version).toBe(1);
            });
        });
        describe('documentation merging', () => {
            it('should merge devdoc from multiple artifacts', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        author: 'Alice',
                        title: 'Shared Title',
                        methods: {
                            'foo()': { details: 'Foo method' },
                        },
                    },
                };
                const artifact2 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'bar',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x5678',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        author: 'Alice',
                        title: 'Shared Title',
                        methods: {
                            'bar()': { details: 'Bar method' },
                        },
                    },
                };
                const result = mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ]);
                expect(result.mergedDevDocs.methods['foo()']).toEqual({ details: 'Foo method' });
                expect(result.mergedDevDocs.methods['bar()']).toEqual({ details: 'Bar method' });
                // Author from second artifact should be kept (or from first if it matches)
                expect(result.mergedDevDocs.author).toBeDefined();
            });
            it('should merge userdoc from multiple artifacts', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                    userdoc: {
                        kind: 'user',
                        version: 1,
                        notice: 'Shared User Notice',
                        methods: {
                            'foo()': { notice: 'Foo notice' },
                        },
                    },
                };
                const artifact2 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'bar',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x5678',
                    userdoc: {
                        kind: 'user',
                        version: 1,
                        notice: 'Shared User Notice',
                        methods: {
                            'bar()': { notice: 'Bar notice' },
                        },
                    },
                };
                const result = mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ]);
                expect(result.mergedUserDocs.methods['foo()']).toEqual({ notice: 'Foo notice' });
                expect(result.mergedUserDocs.methods['bar()']).toEqual({ notice: 'Bar notice' });
                expect(result.mergedUserDocs.notice).toBe('Shared User Notice');
            });
            it('should merge devdoc events', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'event',
                            name: 'Transfer',
                            inputs: [],
                        },
                    ],
                    bytecode: '0x1234',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        events: {
                            'Transfer(address,address,uint256)': { details: 'Transfer event' },
                        },
                    },
                };
                const result = mergeArtifacts([{ name: 'Contract1', artifact: artifact1 }]);
                expect(result.mergedDevDocs.events?.['Transfer(address,address,uint256)']).toEqual({
                    details: 'Transfer event',
                });
            });
            it('should merge devdoc errors', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'error',
                            name: 'InsufficientBalance',
                            inputs: [],
                        },
                    ],
                    bytecode: '0x1234',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        errors: {
                            'InsufficientBalance(uint256)': { details: 'Insufficient balance error' },
                        },
                    },
                };
                const result = mergeArtifacts([{ name: 'Contract1', artifact: artifact1 }]);
                expect(result.mergedDevDocs.errors?.['InsufficientBalance(uint256)']).toEqual({
                    details: 'Insufficient balance error',
                });
            });
            it('should throw error for devdoc method conflicts', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        methods: {
                            'foo()': { details: 'Foo method 1' },
                        },
                    },
                };
                const artifact2 = {
                    abi: [],
                    bytecode: '0x5678',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        methods: {
                            'foo()': { details: 'Foo method 2' },
                        },
                    },
                };
                expect(() => mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ])).toThrow(/Doc.*conflict/);
            });
            it('should throw error for devdoc author conflict', () => {
                const artifact1 = {
                    abi: [],
                    bytecode: '0x1234',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        author: 'Alice',
                    },
                };
                const artifact2 = {
                    abi: [],
                    bytecode: '0x5678',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        author: 'Bob',
                    },
                };
                expect(() => mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ])).toThrow(/DevDoc author conflict/);
            });
            it('should throw error for devdoc title conflict', () => {
                const artifact1 = {
                    abi: [],
                    bytecode: '0x1234',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        author: 'Alice',
                        title: 'Title 1',
                    },
                };
                const artifact2 = {
                    abi: [],
                    bytecode: '0x5678',
                    devdoc: {
                        kind: 'dev',
                        version: 1,
                        author: 'Alice',
                        title: 'Title 2',
                    },
                };
                expect(() => mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ])).toThrow(/DevDoc title conflict/);
            });
            it('should throw error for userdoc notice conflict', () => {
                const artifact1 = {
                    abi: [],
                    bytecode: '0x1234',
                    userdoc: {
                        kind: 'user',
                        version: 1,
                        notice: 'Notice 1',
                    },
                };
                const artifact2 = {
                    abi: [],
                    bytecode: '0x5678',
                    userdoc: {
                        kind: 'user',
                        version: 1,
                        notice: 'Notice 2',
                    },
                };
                expect(() => mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ])).toThrow(/UserDoc notice conflict/);
            });
            it('should merge same devdoc without error', () => {
                const devdoc = {
                    kind: 'dev',
                    version: 1,
                    author: 'Alice',
                    title: 'Shared Title',
                    methods: {
                        'foo()': { details: 'Same details' },
                    },
                };
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                    devdoc: devdoc,
                };
                const artifact2 = {
                    abi: [],
                    bytecode: '0x5678',
                    devdoc: devdoc,
                };
                const result = mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ]);
                expect(result.mergedDevDocs.author).toBe('Alice');
                expect(result.mergedDevDocs.title).toBe('Shared Title');
            });
        });
        describe('return values', () => {
            it('should return all expected properties', () => {
                const artifact = {
                    abi: [
                        {
                            type: 'function',
                            name: 'foo',
                            inputs: [],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                };
                const result = mergeArtifacts([{ name: 'Contract1', artifact: artifact }]);
                expect(result.mergedABI).toBeDefined();
                expect(result.added).toBeDefined();
                expect(result.mergedDevDocs).toBeDefined();
                expect(result.mergedUserDocs).toBeDefined();
                expect(result.sigJSMap).toBeDefined();
            });
        });
        describe('with conflict checking disabled', () => {
            it('should merge artifacts with conflict checking disabled', () => {
                const artifact1 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'transfer',
                            inputs: [{ type: 'address' }, { type: 'uint256' }],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x1234',
                };
                const artifact2 = {
                    abi: [
                        {
                            type: 'function',
                            name: 'transferTokens',
                            inputs: [{ type: 'address' }, { type: 'uint256' }],
                            outputs: [],
                            stateMutability: 'nonpayable',
                        },
                    ],
                    bytecode: '0x5678',
                };
                const result = mergeArtifacts([
                    { name: 'Contract1', artifact: artifact1 },
                    { name: 'Contract2', artifact: artifact2 },
                ], { doNotCheckForConflicts: true });
                // Both should be included since they have different names
                expect(result.mergedABI).toHaveLength(2);
                expect(result.mergedABI[0].name).toBe('transfer');
                expect(result.mergedABI[1].name).toBe('transferTokens');
            });
        });
    });
});
//# sourceMappingURL=artifacts.test.js.map
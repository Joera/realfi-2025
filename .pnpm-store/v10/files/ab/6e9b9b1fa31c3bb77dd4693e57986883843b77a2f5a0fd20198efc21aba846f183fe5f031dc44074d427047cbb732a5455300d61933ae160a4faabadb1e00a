export type Subset = Record<string | number | symbol, unknown>;
declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches an object containing the given key value pairs.
         *
         * If you want to match a top level value, use
         * `expect(...).toHaveSubset(subset)` instead.
         *
         * @param subset - The key value paris to match against.
         *
         * @example
         * ```ts
         * const response = await api.get('/users/me')
         * expect(response).toEqual({
         *   success: true,
         *   data: expect.subset({
         *     name: 'John Doe',
         *     age: 42,
         *   }),
         * })
         * ```
         */
        subset(subset: Subset): never;
    }
}
export declare function subset(subset: unknown): (value: unknown) => boolean;
//# sourceMappingURL=subset.d.ts.map
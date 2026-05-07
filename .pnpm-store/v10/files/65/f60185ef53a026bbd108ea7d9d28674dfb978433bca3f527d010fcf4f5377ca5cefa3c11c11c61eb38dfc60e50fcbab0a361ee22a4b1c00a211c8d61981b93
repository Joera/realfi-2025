declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches an array, Set or iterable that includes the given item or items.
         * Also matches a string that includes the given substring or substrings.
         *
         * If you want to match a top level value, use
         * `expect(...).toInclude(...items)` instead.
         *
         * @param items - Items or matchers to look for. When the value is a string,
         *   all items must be strings too.
         *
         * @example
         * ```ts
         * expect({
         *   numbers: [1, 2, 3],
         *   mixed: [1, 'foo', false],
         *   string: 'I like pancakes',
         * }).toEqual({
         *   numbers: expect.includes(1, 2),
         *   mixed: expect.includes(1, expect.a(String)),
         *   string: expect.includes('pancakes'),
         * })
         * ```
         */
        includes(...items: any[]): never;
    }
}
export declare function includes(...items: any[]): (value: unknown) => boolean;
//# sourceMappingURL=includes.d.ts.map
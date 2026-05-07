declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches an array, string or any object with a `length` property that has
         * the given length.
         *
         * If you want to match a top level value, use
         * `expect(...).toHaveLength(length)` instead.
         *
         * @param length - The expected length. Can be a matcher.
         *
         * @example
         * ```ts
         * expect({
         *   numbers: [1, 2, 3],
         *   letters: 'abcdef',
         * }).toEqual({
         *   numbers: expect.length(3),
         *   letters: expect.length(expect.greaterThan(3)),
         * })
         * ```
         */
        length(length: number): never;
    }
}
export declare function length(length: number): (value: unknown) => boolean;
//# sourceMappingURL=length.d.ts.map
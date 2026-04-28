declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches values for which the predicate returns a truthy value.
         *
         * Usually other matchers are more appropriate, but this can be useful if
         * you are testing something custom.
         *
         * If you want to match a top level value, use
         * `expect(...).toSatisfy(predicate)` instead.
         *
         * @param predicate - The function for checking values.
         *
         * @example
         * ```ts
         * function isShark(value: unknown) {
         *   return value instanceof Fish && value.species === 'shark'
         * }
         * expect(crazyZoologist).toEqual({
         *   name: 'John Doe',
         *   pet: expect.satisfies(isShark),
         * })
         * ```
         */
        satisfies(predicate: (value: unknown) => boolean): never;
    }
}
export declare function satisfies(predicate: (value: unknown) => boolean): (value: unknown) => boolean;
//# sourceMappingURL=satisfies.d.ts.map
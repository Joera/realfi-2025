declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches numbers that are less than the given target.
         *
         * Works for both numbers and bigints.
         *
         * If you want to match a top level value, use
         * `expect(...).toBeLessThan(target)` instead.
         *
         * @param target - The target value to compare to.
         *
         * @example
         * ```ts
         * expect({
         *   salary: 100_000,
         *   bonus: 10_000,
         * }).toEqual({
         *   salary: expect.lessThan(200_000),
         *   bonus: expect.lessThan(20_000),
         * })
         * ```
         */
        lessThan(target: number | bigint): never;
    }
}
export declare function lessThan(target: number | bigint): (value: unknown) => boolean;
//# sourceMappingURL=lessThan.d.ts.map
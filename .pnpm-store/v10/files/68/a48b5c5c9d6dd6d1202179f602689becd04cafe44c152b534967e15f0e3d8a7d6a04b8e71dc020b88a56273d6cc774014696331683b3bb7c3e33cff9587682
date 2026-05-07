declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches numbers that are integers between Number.MIN_SAFE_INTEGER nad
         * Number.MAX_SAFE_INTEGER.
         *
         * Works for both numbers and bigints.
         *
         * If you want to match a top level value, use
         * `expect(...).toBeASafeInteger()` instead.
         *
         * @example
         * ```ts
         * const counts = getExperimentStats()
         * expect(counts).toEqual({
         *   min: 0,
         *   max: expect.safeInteger(),
         *   median: expect.safeInteger(),
         * })
         * ```
         */
        safeInteger(): never;
    }
}
export declare function safeInteger(): (value: unknown) => boolean;
//# sourceMappingURL=safeInteger.d.ts.map
declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches numbers that are between the two numbers. The range is
         * `[min, max]`, inclusive on both sides.
         *
         * Works for both numbers and bigints.
         *
         * If you want to match a top level value, use
         * `expect(...).toBeBetween(min, max)` instead.
         *
         * @param min - The minimum value, inclusive.
         * @param max - The maximum value, inclusive.
         *
         * @example
         * ```ts
         * const location = getLatLon()
         * expect(location).toEqual({
         *   lat: expect.between(-90, 90),
         *   lon: expect.between(-180, 180),
         * })
         * ```
         */
        between(min: number | bigint, max: number | bigint): never;
    }
}
export declare function between(min: number | bigint, max: number | bigint): (value: unknown) => boolean;
//# sourceMappingURL=between.d.ts.map
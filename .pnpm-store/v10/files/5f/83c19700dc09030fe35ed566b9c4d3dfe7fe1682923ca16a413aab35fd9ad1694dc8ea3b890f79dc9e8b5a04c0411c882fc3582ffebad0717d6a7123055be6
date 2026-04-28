declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches strings that match the given regular expression.
         *
         * If you want to match a top level value, use
         * `expect(...).toMatchRegex(regex)` instead.
         *
         * @param regex - The regular expression to test the matched values.
         *
         * @example
         * ```ts
         * const contact = await customer.getUSContactInfo()
         * expect(contact).toEqual({
         *   state: expect.regex(/^[A-Z]{2}$/),
         *   zipCode: expect.regex(/^\d{5}$/),
         *   phoneNumber: expect.regex(/^\d{3}-\d{3}-\d{4}$/),
         * })
         * ```
         */
        regex(regex: RegExp): never;
    }
}
export declare function regex(regex: RegExp): (value: unknown) => boolean;
//# sourceMappingURL=regex.d.ts.map
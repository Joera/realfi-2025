export interface ZodSchema {
    parse(value: unknown): any;
}
declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches values conforming to the provided zod schema.
         *
         * If you want to match a top level value, use
         * `expect(...).toMatchSchema(schema)` instead.
         *
         * @param schema - The zod schema to use.
         *
         * @example
         * ```ts
         * import * as z from 'zod'
         * const product = await getLatestProduct()
         * expect(product).toEqual({
         *   name: 'Turbocharger 9000',
         *   uuid: expect.schema(z.string().uuid()),
         *   pricing: expect.schema(
         *     z.object({
         *       price: z.number().positive(),
         *       currency: z.string().length(3),
         *     }),
         *   ),
         * })
         * ```
         */
        schema(schema: ZodSchema): never;
    }
}
export declare function schema(schema: ZodSchema): (value: unknown) => boolean;
//# sourceMappingURL=schema.d.ts.map
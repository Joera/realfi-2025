export type Newable<T> = new (...args: any[]) => T;
export type NewableOrPrimitive = Newable<any> | SymbolConstructor | BigIntConstructor;
declare module '../../expect.js' {
    interface Matchers {
        /**
         * Matches an instance of a provided class or a primitive type. It is
         * compatible with built-in types like strings, numbers, and dates.
         *
         * Using this matcher is recommended when you don't care about the exact
         * value as long as it matches a given type.
         *
         * If you want to match a top level value, use `expect(...).toBeA(type)`
         * instead.
         *
         * @param type - The class or primitive constructor to match against.
         *
         * @example
         * ```ts
         * // Primitives
         * expect({ foo: Math.random() }).toEqual({ foo: expect.a(Number) })
         *
         * // Classes
         * expect({
         *   employee: new Employee('John Doe', 42),
         *   birthday: new Date('1990-01-01'),
         * }).toEqual({
         *   employee: expect.a(Employee),
         *   birthday: expect.a(Date),
         * })
         * ```
         */
        a<T extends NewableOrPrimitive>(type: T): never;
    }
}
export declare function a(type: NewableOrPrimitive): (value: unknown) => boolean;
//# sourceMappingURL=a.d.ts.map
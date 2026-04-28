import { Control } from './Control.js';
export interface Validators<T> {
}
export interface Matchers {
}
export declare class Matcher {
    readonly representation: string;
    readonly check: (v: unknown) => boolean;
    constructor(representation: string, check: (v: unknown) => boolean);
    toString(): string;
}
export declare function registerValidator(name: string, validator: (control: Control, ...args: any[]) => any): void;
type ValidatorsAndModifiers<T> = Validators<T> & {
    /**
     * Negates the following assertion.
     */
    not: Validators<T>;
};
export declare function registerMatcher<A extends any[]>(name: string, check: (...args: A) => (value: unknown) => boolean, format?: (...args: A) => string): void;
export declare const expect: (<T>(value: T) => ValidatorsAndModifiers<T>) & Matchers;
export {};
//# sourceMappingURL=expect.d.ts.map
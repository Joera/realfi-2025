type Logger = {
    readonly assert: (condition?: boolean, ...data: any[]) => void;
    readonly error: (...data: any[]) => void;
    readonly warn: (...data: any[]) => void;
    readonly info: (...data: any[]) => void;
    readonly log: (...data: any[]) => void;
    readonly debug: (...data: any[]) => void;
    readonly dir: (item?: any, options?: any) => void;
    readonly table: (tabularData?: any, properties?: string[]) => void;
    readonly time: (label: string) => void;
    readonly timeEnd: (label: string) => void;
    readonly timeLog: (label?: string) => void;
    readonly trace: (...data: any[]) => void;
    readonly write: (msg: string) => void;
};
type CLogger = Logger & {
    namespace: string;
    decoration?: string;
    level: number | undefined;
    traceLevel: number | undefined;
    enabled: boolean;
};
type G = Record<string, unknown> & {
    console: Console;
    location: Location;
};
declare const noop: () => undefined;
declare const W: G;
declare const oldConsole: Console;
declare const disabledRegexps: RegExp[];
declare const enabledRegexps: RegExp[];
declare function bindCall<T>(logFunc: (...args: T[]) => void, logger: CLogger, level: number, allowDecoration?: boolean): (...args: T[]) => void;
declare const _loggers: {
    [namespace: string]: CLogger;
};
declare function write(msg: string): void;
declare const factory: {
    (namespace: string, options?: {
        decoration?: string;
    }): CLogger;
    level: number;
    traceLevel: number;
    labelVisible: boolean | string;
    setTraceLevelFor: (namespace: string, newLevel: number) => void;
    disable: () => void;
    enable: (namespaces?: string) => void;
};
declare const logLevels: {
    [name: string]: number;
};
declare function enabled(name: string, { disabledRegexps, enabledRegexps }: {
    disabledRegexps: RegExp[];
    enabledRegexps: RegExp[];
}): boolean;
declare function processNamespaces(namespaces: string, { disabledRegexps, enabledRegexps }: {
    disabledRegexps: RegExp[];
    enabledRegexps: RegExp[];
}, func: (namespace: string, enabled: boolean) => void): void;
declare const vars: string[];
//# sourceMappingURL=index.d.ts.map